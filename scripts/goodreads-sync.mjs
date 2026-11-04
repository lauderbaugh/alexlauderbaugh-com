#!/usr/bin/env node
// Counts books with a Goodreads "date read" in the current year and writes
// { year, count, updatedAt } to a Vercel Global Config item, which /books reads
// (lib/goodreads.ts).
//
// Why this runs locally: Goodreads removed its public shelf RSS in 2026 and
// shelf pages now require sign-in, so this needs a Goodreads session cookie.
// The cookie lives outside the repo in ~/.config/alexlauderbaugh/goodreads-sync.env:
//
//   GOODREADS_COOKIE="<full Cookie header copied from a signed-in goodreads.com request>"
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
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

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

function fail(message) {
  console.error(`[${new Date().toISOString()}] goodreads-sync: ${message}`);
  notify(message);
  process.exit(1);
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
    if (location.includes("sign_in")) {
      fail("Goodreads session expired. Refresh GOODREADS_COOKIE in ~/.config/alexlauderbaugh/goodreads-sync.env");
    }
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
  if (!env.GOODREADS_COOKIE) fail("GOODREADS_COOKIE not set");
  if (!DRY_RUN && !env.GLOBAL_CONFIG_ID) fail("GLOBAL_CONFIG_ID not set");
  if (!DRY_RUN && !env.VERCEL_TOKEN) fail("VERCEL_TOKEN not set");

  const year = new Date().getFullYear();
  let total = 0;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await fetchShelfPage(env.GOODREADS_COOKIE, page);
    const { rows, count } = countRowsReadInYear(html, year);
    if (page === 1 && rows === 0) fail("no books found on the shelf page — Goodreads layout may have changed");
    total += count;
    // Sorted by date read, newest first: once a page has none from this year, stop.
    if (count === 0 || rows < 100) break;
  }

  // A zero mid-year almost certainly means a parse problem, not zero reading.
  if (total === 0 && new Date().getMonth() > 0) fail("parsed 0 books for this year — refusing to overwrite");

  const value = { year, count: total, updatedAt: new Date().toISOString() };
  console.log(`[${value.updatedAt}] goodreads-sync: ${total} read in ${year}`);
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
