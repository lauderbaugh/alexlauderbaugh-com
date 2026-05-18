import { z } from "zod";

export const LOG_TYPES = ["build", "book", "note", "ship"] as const;
export const RATINGS = ["Required", "Recommended", "Good", "Skippable", "Unfinished"] as const;
export const STATUSES = ["Building", "Active", "Shipped", "Archived"] as const;
export const CATEGORIES = ["Software", "Athletics"] as const;

export type LogType = (typeof LOG_TYPES)[number];
export type Rating = (typeof RATINGS)[number];
export type ProjectStatus = (typeof STATUSES)[number];
export type ProjectCategory = (typeof CATEGORIES)[number];

export const TYPE_LABEL: Record<LogType, string> = {
  build: "Build",
  book: "Book",
  note: "Note",
  ship: "Ship",
};

export const STATUS_ORDER = STATUSES;

export const logFrontmatterSchema = z.object({
  title: z.string(),
  date: z.union([z.string(), z.date()]).transform((v) =>
    v instanceof Date ? v.toISOString().slice(0, 10) : v,
  ),
  type: z.enum(LOG_TYPES),
  project: z.string().optional(),
  author: z.string().optional(),
  rating: z.enum(RATINGS).optional(),
  draft: z.boolean().default(false),
});

export const projectFrontmatterSchema = z.object({
  title: z.string(),
  status: z.enum(STATUSES),
  category: z.enum(CATEGORIES),
  summary: z.string(),
  weekMarker: z.string().optional(),
  currentFocus: z.array(z.string()).default([]),
  links: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .default([]),
  draft: z.boolean().default(false),
});

export const principlesFrontmatterSchema = z.object({
  title: z.string().default("Principles"),
  intro: z.string().optional(),
  items: z
    .array(z.object({ heading: z.string(), body: z.string() }))
    .min(1),
});

export const pageFrontmatterSchema = z.object({
  title: z.string(),
});

export type LogFrontmatter = z.infer<typeof logFrontmatterSchema>;
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type PrinciplesFrontmatter = z.infer<typeof principlesFrontmatterSchema>;
export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

export interface LogEntry extends LogFrontmatter {
  slug: string;
  sourcePath: string;
  body: string;
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  sourcePath: string;
  body: string;
}
