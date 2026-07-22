export const SITE = {
  name: "Alex Lauderbaugh",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://alexlauderbaugh.com",
  location: "Auckland, New Zealand",
  whereLine:
    "Auckland · CPO at BettrData · Building Syscribe",
  intro:
    "Product leader and builder. Currently CPO at BettrData and building Syscribe, an AI-powered documentation platform. Based in Auckland — mostly writing about product, systems, and what I'm reading.",
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alauderbaugh/" },
    { label: "GitHub", href: "https://github.com/lauderbaugh" },
    { label: "Goodreads", href: "https://www.goodreads.com/user/show/69418981-alex-lauderbaugh" },
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
  { id: "projects", href: "/projects", label: "Projects" },
  { id: "books", href: "/books", label: "Books" },
  { id: "principles", href: "/principles", label: "Principles" },
  { id: "about", href: "/about", label: "About" },
] as const;
