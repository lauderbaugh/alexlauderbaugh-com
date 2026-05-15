# Architecture

One-time reference. Read once, refer back as needed. Persistent conventions live in `/CLAUDE.md`.

---

## Directory structure

```
alexlauderbaugh.com/
├── CLAUDE.md                    # persistent context (read every session)
├── README.md                    # public-facing repo description
├── LICENSE                      # MIT, or "All rights reserved" for content
├── .gitignore
├── .env.local                   # gitignored
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
│
├── app/                         # Next.js App Router
│   ├── layout.tsx               # root layout: <Header />, <Footer />, theme provider
│   ├── page.tsx                 # /
│   ├── globals.css              # tailwind + small global rules
│   ├── log/
│   │   ├── page.tsx             # /log (with filter)
│   │   └── [slug]/
│   │       └── page.tsx         # /log/[slug]
│   ├── books/
│   │   └── page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── principles/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── feed.xml/
│   │   └── route.ts             # RSS handler
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── header.tsx               # 'use client' — nav + theme toggle + global hotkeys
│   ├── footer.tsx
│   ├── log-entry.tsx
│   ├── type-badge.tsx
│   ├── filter-row.tsx           # 'use client' — filter state via URL search params
│   ├── arrow-link.tsx
│   ├── theme-toggle.tsx         # 'use client'
│   └── mdx-components.tsx       # custom MDX renderers (h3, p, a, etc.)
│
├── content/
│   ├── log/
│   │   ├── syscribe-w5.mdx
│   │   ├── antifragile.mdx
│   │   ├── panpacs-w8.mdx
│   │   └── ...
│   ├── projects/
│   │   ├── syscribe.mdx
│   │   ├── panpacs.mdx
│   │   ├── bjj-map.mdx
│   │   └── ...
│   ├── pages/
│   │   ├── about.mdx
│   │   └── principles.mdx
│   └── _drafts/                 # gitignored
│
├── lib/
│   ├── content.ts               # MDX loading + frontmatter parsing
│   ├── site.ts                  # SITE constants (name, location, where-line, social)
│   ├── types.ts                 # TS types for frontmatter
│   └── github.ts                # build "edit on github" URL for a given source path
│
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-default.png           # social share image
│   └── (any future images)
│
├── docs/
│   ├── architecture.md          # this file
│   └── build-plan.md            # staged Claude Code sessions
│
└── legacy/
    └── index.html               # the original wireframe, kept for reference
```

---

## Content loading

`lib/content.ts` exposes typed loaders for the build:

```ts
export type LogType = 'build' | 'book' | 'note' | 'ship';
export type LogRating = 'would re-read' | 'good' | 'skim';

export interface LogEntry {
  slug: string;
  sourcePath: string;          // relative path for "edit on github" link
  title: string;
  date: string;                // ISO
  type: LogType;
  project?: string;
  author?: string;             // book only
  rating?: LogRating;          // book only
  draft: boolean;
  Content: () => JSX.Element;  // compiled MDX
}

export type ProjectStatus = 'Building' | 'Active' | 'Shipped' | 'Archived';
export type ProjectCategory = 'Software' | 'Athletics';

export interface Project {
  slug: string;
  sourcePath: string;
  title: string;
  status: ProjectStatus;
  category: ProjectCategory;
  summary: string;
  weekMarker?: string;
  currentFocus: string[];
  links: { label: string; href: string }[];
  draft: boolean;
  Content: () => JSX.Element;
}

export function getAllLogEntries(): LogEntry[];     // excludes drafts
export function getLogEntry(slug: string): LogEntry | null;
export function getBooks(): LogEntry[];             // type === 'book'
export function getAllProjects(): Project[];         // excludes drafts
export function getProject(slug: string): Project | null;
```

Loaders read the filesystem at build time, parse frontmatter with `gray-matter`, and compile MDX. Validate frontmatter against a schema (Zod or manual type guards) so a typo in `status:` fails the build instead of silently breaking sort order.

---

## Filter state

Filters on `/log` and `/projects` are reflected in the URL via search params:

- `/log?filter=book` — books only
- `/projects?filter=athletics` — athletics only

Use the App Router's `useSearchParams()` in client filter components. Server components read `searchParams` prop. The default (no filter param) shows everything.

This costs nothing and makes filtered views shareable and bookmarkable. The wireframe's `useState` filter is fine for prototyping but should not survive the port.

---

## Theme system

- Use `next-themes` with `attribute="class"` and `defaultTheme="light"`.
- The theme provider wraps the app in `app/layout.tsx`.
- The `ThemeToggle` component is the only client component that reads/writes theme.
- To avoid FOUC: `next-themes` injects a small inline script that runs before paint. Don't disable this.
- `prefers-color-scheme` respected as the *initial* default if the user hasn't toggled; once they toggle, persist their choice (next-themes default behavior).

---

## "Edit this page on github"

Repo: `https://github.com/lauderbaugh/alexlauderbaugh-com`
Branch: `main`

Build the URL from the source file's path relative to repo root:

```ts
export function editOnGithubUrl(sourcePath: string): string {
  return `https://github.com/lauderbaugh/alexlauderbaugh-com/blob/main/${sourcePath}`;
}
```

Pass `sourcePath` down to the `<Footer />` via a layout-level prop or React context. The footer shows the link only when a sourcePath is provided (e.g., not on the projects index, which is a generated view).

For pages that aren't backed by a single MDX file (the homepage, `/log`, `/projects`, `/books`), the link can point at the route's `page.tsx`, or be omitted. Pick one and be consistent. Recommendation: omit on generated views, show on content-backed views (`/log/[slug]`, `/projects/[slug]`, `/about`, `/principles`).

---

## RSS feed

`/feed.xml` serves an RSS 2.0 feed of all non-draft log entries, newest first, with the full body rendered as HTML in `<description>` (CDATA-wrapped).

Use the `feed` npm package or hand-roll the XML — both are fine. The handler lives at `app/feed.xml/route.ts` and returns `Content-Type: application/rss+xml`.

---

## SEO and metadata

- Per-page `<title>` and `<meta name="description">` via the App Router `generateMetadata` export.
- Default OG image: `/public/og-default.png` (1200×630). Per-post OG images can come later — not required for v1.
- Twitter card: `summary_large_image`.
- Site title: `Alex Lauderbaugh`. Page titles: `{page} · Alex Lauderbaugh`.

---

## Performance budget

- Lighthouse performance ≥ 95 on the homepage.
- No client JS on pages that don't need it (everything except header/filter/theme should be server components).
- Fonts loaded via `next/font` with `display: 'swap'`.
- Images (when added) use `next/image`.

---

## Deployment

Vercel project name: `alexlauderbaugh-com`.

Environment variables (Vercel project settings, NOT committed):
- `NEXT_PUBLIC_SITE_URL=https://alexlauderbaugh.com` (used for canonical URLs, OG image absolute paths, RSS feed URLs)

Build command: `pnpm build` (Vercel default).
Output: Next.js automatic.
Domain: `alexlauderbaugh.com` apex + `www` redirect.
Analytics: enable Vercel Analytics in project settings.

---

## .gitignore essentials

```
node_modules
.next
out
.env*
!.env.example
.DS_Store
*.log

# Content drafts — never publish
/content/_drafts/

# IDE
.vscode/
.idea/
```

---

## Commands

```bash
# install
pnpm install

# develop
pnpm dev                      # localhost:3000

# verify before commit
pnpm typecheck                # tsc --noEmit
pnpm lint                     # next lint
pnpm build                    # full prod build, catches MDX errors

# preview prod locally
pnpm build && pnpm start

# add content
# (no script needed — just create the file)
touch content/log/my-new-entry.mdx
```
