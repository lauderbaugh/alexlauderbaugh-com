export type BjjBelt = "white" | "blue" | "purple" | "brown" | "black";

export interface BjjConfig {
  belt: BjjBelt;
  stripes: number;
}

export const SITE = {
  name: "Alex Lauderbaugh",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://alexlauderbaugh.com",
  bjj: { belt: "brown", stripes: 0 } as BjjConfig | undefined,
  location: "Auckland, New Zealand",
  whereLine:
    "Auckland · Building Syscribe · CPO at BettrData · Open to investor conversations.",
  intro:
    "Product leader and builder. Currently CPO at BettrData and building Syscribe, an AI-powered documentation platform. Based in Auckland — mostly writing about product, systems, and what I'm reading.",
  social: [
    { label: "LinkedIn", href: "#" },
    { label: "GitHub", href: "https://github.com/lauderbaugh" },
    { label: "Twitter", href: "#" },
    { label: "Email", href: "mailto:hi@alexlauderbaugh.com" },
    { label: "RSS", href: "/feed.xml" },
  ],
  lastUpdated: "May 14, 2026",
  repo: {
    owner: "lauderbaugh",
    name: "alexlauderbaugh-com",
    branch: "main",
  },
} as const;

export const NAV = [
  { id: "log", href: "/log", label: "Log" },
  { id: "books", href: "/books", label: "Books" },
  { id: "projects", href: "/projects", label: "Projects" },
  { id: "principles", href: "/principles", label: "Principles" },
  { id: "about", href: "/about", label: "About" },
] as const;
