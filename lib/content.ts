import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  logFrontmatterSchema,
  pageFrontmatterSchema,
  principlesFrontmatterSchema,
  projectFrontmatterSchema,
  STATUS_ORDER,
  type LogEntry,
  type PageFrontmatter,
  type PrinciplesFrontmatter,
  type Project,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const LOG_DIR = path.join(CONTENT_DIR, "log");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const PAGES_DIR = path.join(CONTENT_DIR, "pages");

function readMdxFiles(dir: string): { slug: string; raw: string; sourcePath: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(dir, file);
      return {
        slug: file.replace(/\.mdx?$/, ""),
        raw: fs.readFileSync(filePath, "utf8"),
        sourcePath: path.relative(process.cwd(), filePath),
      };
    });
}

export function getAllLogEntries(): LogEntry[] {
  const entries = readMdxFiles(LOG_DIR).map(({ slug, raw, sourcePath }) => {
    const { data, content } = matter(raw);
    const fm = logFrontmatterSchema.parse(data);
    return { ...fm, slug, sourcePath, body: content };
  });
  return entries
    .filter((e) => !e.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getLogEntry(slug: string): LogEntry | null {
  return getAllLogEntries().find((e) => e.slug === slug) ?? null;
}

export function getBooks(): LogEntry[] {
  return getAllLogEntries().filter((e) => e.type === "book");
}

export function getAllProjects(): Project[] {
  const projects = readMdxFiles(PROJECTS_DIR).map(({ slug, raw, sourcePath }) => {
    const { data, content } = matter(raw);
    const fm = projectFrontmatterSchema.parse(data);
    return { ...fm, slug, sourcePath, body: content };
  });
  return projects
    .filter((p) => !p.draft)
    .sort((a, b) => {
      const sa = STATUS_ORDER.indexOf(a.status);
      const sb = STATUS_ORDER.indexOf(b.status);
      return sa - sb;
    });
}

export function getProject(slug: string): Project | null {
  return getAllProjects().find((p) => p.slug === slug) ?? null;
}

function readPageRaw(name: string): { raw: string; sourcePath: string } | null {
  const filePath = path.join(PAGES_DIR, `${name}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return {
    raw: fs.readFileSync(filePath, "utf8"),
    sourcePath: path.relative(process.cwd(), filePath),
  };
}

export function getPrinciples(): {
  frontmatter: PrinciplesFrontmatter;
  sourcePath: string;
} | null {
  const file = readPageRaw("principles");
  if (!file) return null;
  const { data } = matter(file.raw);
  return {
    frontmatter: principlesFrontmatterSchema.parse(data),
    sourcePath: file.sourcePath,
  };
}

export function getAboutPage(): {
  frontmatter: PageFrontmatter;
  body: string;
  sourcePath: string;
} | null {
  const file = readPageRaw("about");
  if (!file) return null;
  const { data, content } = matter(file.raw);
  return {
    frontmatter: pageFrontmatterSchema.parse(data),
    body: content,
    sourcePath: file.sourcePath,
  };
}
