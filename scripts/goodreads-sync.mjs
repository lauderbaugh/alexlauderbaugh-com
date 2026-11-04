#!/usr/bin/env node
// Counts books with a Goodreads "date read" in the current year and writes
// { year, count, updatedAt } to a Vercel Global Config item, which /books reads
// (lib/goodreads.ts).
//
// Why this runs locally: Goodreads removed its public shelf RSS in 2026 and
// shelf pages now require sign-in, so this needs a Goodreads session cookie.
// It reads the current one straight from Chrome's cookie store on each run
// (decrypted with the "Chrome Safe Storage" Keychain key; only goodreads.com
// rows are queried), so signing in again in Chrome is all a refresh takes.
// Config lives outside the repo in ~/.config/alexlauderbaugh/goodreads-sync.env:
//
//   CHROME_PROFILE="Profile 2"   # Chrome profile dir signed in to Goodreads
//   GOODREADS_COOKIE="..."       # optional fallback: a copied Cookie header
//   GLOBAL_CONFIG_ID="ecfg_..."
//   VERCEL_TOKEN="<account token from the Vercel account that owns the site>"
//   VERCEL_TEAM_ID="team_..."   # that account's team id
//
// Writes go straight to the Vercel REST API with that token, independent of
// whichever account the Vercel CLI happens to be logged into.
//
// Safety: on any failure (signed out, layout change, network) it exits non-zero
// WITHOUT writing, so the site keeps showing the last good count.
//
// Usage: node scripts/goodreads-sync.mjs [--dry-run]

import { execFileSync } from "node:child_process";
import { createDecipheriv, pbkdf2Sync } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const USER_ID = "69418981";
const ITEM_KEY = "goodreadsReadCount"; // keep in sync with lib/goodreads.ts
const ENV_FILE = join(homedir(), ".config/alexlauderbaugh/goodreads-sync.env");
const MAX_PAGES = 10; // 1,000 books — far beyond a year's reading
const DRY_RUN = process.argv.includes("--dry-run");

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return env;
}

function notify(message) {
  try {
    execFileSync("osascript", [
      "-e",
      `display notification ${JSON.stringify(message)} with title "Goodreads sync"`,
    ]);
  } catch {
    // Notifications are best-effort.
  }
}

function log(message) {
  console.log(`[${new Date().toISOString()}] goodreads-sync: ${message}`);
}

function fail(message) {
  console.error(`[${new Date().toISOString()}] goodreads-sync: ${message}`);
  notify(message);
  process.exit(1);
}

// Builds a Cookie header for www.goodreads.com from Chrome's on-disk store.
// macOS Chrome encrypts values with AES-128-CBC under a key derived from the
// "Chrome Safe Storage" Keychain password; from DB version 24 the plaintext
// is prefixed with a 32-byte SHA-256 of the host, which we drop.
function readChromeCookie(profile) {
  const profileDir = join(homedir(), "Library/Application Support/Google/Chrome", profile);
  const dbPath = join(profileDir, "Cookies");
  if (!existsSync(dbPath)) throw new Error(`no Chrome cookie store at ${dbPath}`);

  const password = execFileSync(
    "security",
    ["find-generic-password", "-w", "-s", "Chrome Safe Storage"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  ).trim();
  const key = pbkdf2Sync(password, "saltysalt", 1003, 16, "sha1");

  // Chrome keeps the DB open; read a private copy.
  const dir = mkdtempSync(join(tmpdir(), "goodreads-sync-"));
  try {
    const copy = join(dir, "Cookies");
    copyFileSync(dbPath, copy);
    for (const ext of ["-journal", "-wal"]) {
      if (existsSync(dbPath + ext)) copyFileSync(dbPath + ext, copy + ext);
    }
    const db = new DatabaseSync(copy, { readOnly: true });
    const version = Number(db.prepare("SELECT value FROM meta WHERE key = 'version'").get()?.value ?? 0);
    const query = db.prepare(
      `SELECT name, encrypted_value, expires_utc FROM cookies
       WHERE host_key IN ('www.goodreads.com', '.goodreads.com', '.www.goodreads.com', 'goodreads.com')`,
    );
    query.setReadBigInts(true);
    // expires_utc is microseconds since 1601-01-01; 0 means session cookie.
    const nowChrome = (BigInt(Date.now()) + 11644473600000n) * 1000n;
    const pairs = [];
    for (const row of query.all()) {
      if (row.expires_utc !== 0n && row.expires_utc < nowChrome) continue;
      const enc = Buffer.from(row.encrypted_value);
      if (enc.subarray(0, 3).toString() !== "v10") continue;
      const decipher = createDecipheriv("aes-128-cbc", key, Buffer.alloc(16, " "));
      let plain = Buffer.concat([decipher.update(enc.subarray(3)), decipher.final()]);
      if (version >= 24) plain = plain.subarray(32);
      pairs.push(`${row.name}=${plain.toString("utf8")}`);
    }
    db.close();
    if (pairs.length === 0) throw new Error(`no Goodreads cookies in Chrome profile "${profile}"`);
    return pairs.join("; ");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function fetchShelfPage(cookie, page) {
  const url =
    `https://www.goodreads.com/review/list/${USER_ID}` +
    `?shelf=read&sort=date_read&order=d&per_page=100&view=table&page=${page}`;
  const res = await fetch(url, {
    headers: {
      Cookie: cookie,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    },
    redirect: "manual",
  });
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location") ?? "";
    if (location.includes("sign_in")) return null; // signed out
    fail(`unexpected redirect to ${location}`);
  }
  if (!res.ok) fail(`Goodreads returned HTTP ${res.status} for page ${page}`);
  return res.text();
}

// Each book is a <tr class="bookalike review">; its date-read cell can hold
// several <span class="date_read_value"> (re-reads). Dates are "Oct 27, 2026"
// or month-only "Nov 2026", so match on the trailing year.
function countRowsReadInYear(html, year) {
  const rows = html.split(/<tr[^>]*class="bookalike review"/).slice(1);
  let count = 0;
  for (const row of rows) {
    const dates = [...row.matchAll(/class="date_read_value">([^<]*)</g)].map((m) => m[1].trim());
    if (dates.some((d) => d.endsWith(String(year)))) count += 1;
  }
  return { rows: rows.length, count };
}

async function main() {
  let env;
  try {
    env = loadEnv(ENV_FILE);
  } catch {
    fail(`missing ${ENV_FILE}`);
  }

  // Prefer Chrome's live session; fall back to a copied cookie if present.
  const candidates = [];
  try {
    candidates.push({ source: "Chrome", cookie: readChromeCookie(env.CHROME_PROFILE || "Default") });
  } catch (err) {
    log(`couldn't read Chrome cookies (${err.message.split("\n")[0]}); trying env file`);
  }
  if (env.GOODREADS_COOKIE) candidates.push({ source: "env file", cookie: env.GOODREADS_COOKIE });
  if (candidates.length === 0) fail("no Goodreads cookie available from Chrome or the env file");
  if (!DRY_RUN && !env.GLOBAL_CONFIG_ID) fail("GLOBAL_CONFIG_ID not set");
  if (!DRY_RUN && !env.VERCEL_TOKEN) fail("VERCEL_TOKEN not set");

  const year = new Date().getFullYear();
  let total = 0;
  let cookie = null;
  let firstPage = null;
  for (const c of candidates) {
    firstPage = await fetchShelfPage(c.cookie, 1);
    if (firstPage !== null) {
      cookie = c.cookie;
      log(`signed in via ${c.source} cookie`);
      break;
    }
  }
  if (cookie === null) fail("Goodreads is signed out. Sign in to goodreads.com in Chrome and it will pick up the new session");

  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = page === 1 ? firstPage : await fetchShelfPage(cookie, page);
    if (html === null) fail(`Goodreads signed out mid-sync on page ${page}`);
    const { rows, count } = countRowsReadInYear(html, year);
    if (page === 1 && rows === 0) fail("no books found on the shelf page — Goodreads layout may have changed");
    total += count;
    // Sorted by date read, newest first: once a page has none from this year, stop.
    if (count === 0 || rows < 100) break;
  }

  // A zero mid-year almost certainly means a parse problem, not zero reading.
  if (total === 0 && new Date().getMonth() > 0) fail("parsed 0 books for this year — refusing to overwrite");

  const value = { year, count: total, updatedAt: new Date().toISOString() };
  log(`${total} read in ${year}`);
  if (DRY_RUN) return;

  const url = new URL(`https://api.vercel.com/v1/edge-config/${env.GLOBAL_CONFIG_ID}/items`);
  if (env.VERCEL_TEAM_ID) url.searchParams.set("teamId", env.VERCEL_TEAM_ID);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ operation: "upsert", key: ITEM_KEY, value }] }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    fail(`Vercel write failed (HTTP ${res.status}): ${body?.error?.message ?? "unknown error"}`);
  }
}

main().catch((err) => fail(err.message));
