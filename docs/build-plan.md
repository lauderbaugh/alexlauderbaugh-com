# Build plan

Five sequential Claude Code sessions. Run them in order. Each is scoped to one focused work block (~30-90 minutes of Claude Code time). Acceptance criteria at the end of each session — confirm them before moving on.

---

## Session 1 — Scaffolding + design system

**Goal:** Empty Next.js project that renders the homepage, log feed, and one project page with the wireframe's exact design language. No real content yet — placeholder MDX files that mirror the wireframe's sample entries.

**Inputs:**
- This repo (currently has `legacy/index.html`, the handoff docs, and nothing else)
- `legacy/index.html` is the design contract

**Tasks:**
1. Initialize Next.js 15 + TypeScript + Tailwind v4 + App Router. Use `pnpm`.
2. Install: `@next/mdx`, `next-mdx-remote` (or `@mdx-js/loader`), `gray-matter`, `next-themes`, `date-fns`. Skip `reading-time` and any other extras for now.
3. Wire up `next/font/google` for Source Serif 4, Inter, JetBrains Mono. Body uses Inter, with `.serif` and `.mono` utility classes.
4. Translate the wireframe's Tailwind theme config (colors, font families) into `tailwind.config.ts`. All color tokens match `CLAUDE.md` exactly.
5. Build the global layout: `<Header />`, `<Footer />`, `<ThemeProvider>` wrapper. Header includes nav, where-line with accent dot, theme toggle, and the `g + key` hotkey handler.
6. Build the four reusable components: `<LogEntry />`, `<TypeBadge />`, `<FilterRow />`, `<ArrowLink />`. Match the wireframe's markup and styling exactly.
7. Write `lib/site.ts` exporting `SITE` constants (name, location, where-line, social links, lastUpdated). Match the wireframe.
8. Build the three sample pages:
   - `/` (homepage with hero, Latest, Building, Recently read sections)
   - `/log` (feed with filter via search params)
   - `/projects/syscribe` (single project page)
9. Create 6-8 placeholder MDX files in `/content/log/` and 2 in `/content/projects/` matching the wireframe's sample content exactly. Build `lib/content.ts` to load them.

**Out of scope for this session:**
- `/books`, `/projects` (index), `/principles`, `/about` — those come in Session 2.
- RSS feed, sitemap, edit-on-github links — Session 3.
- Real copy — Session 5.

**Acceptance criteria:**
- `pnpm dev` runs without errors.
- Visiting `/` renders the homepage matching the wireframe within reason. Light and dark modes both work, toggle persists.
- Visiting `/log` shows the feed. Clicking filters changes the URL (e.g., `/log?filter=book`) and filters the entries.
- Visiting `/projects/syscribe` renders the single project page including the "current focus" callout.
- `g h`, `g l`, `g p` keyboard shortcuts navigate.
- `pnpm build` succeeds. `pnpm typecheck` passes.
- No `'use client'` on pages or layouts. Only `header.tsx`, `theme-toggle.tsx`, `filter-row.tsx` should be client components.

---

## Session 2 — Remaining routes

**Goal:** Fill in `/books`, `/projects` (index), `/principles`, `/about`, `/log/[slug]`. Same design language as Session 1. Site is now feature-complete in shape.

**Tasks:**
1. `/books` — read all log entries with `type: book`, render with the running counter ("X read this year · Y total in 2026"). Reuses `<LogEntry />`.
2. `/projects` — read all projects, sort by status order [Building, Active, Shipped, Archived], render row per project with status + category + one-line summary + arrow link. Filter row at top: `All · Software · Athletics`, reflected in `?filter=` search param.
3. `/projects/[slug]` — generalize the Syscribe page from Session 1 to load any project by slug. Use `generateStaticParams` for static generation.
4. `/log/[slug]` — single log entry permalink. Same `<LogEntry />` layout but no list context. Used as the target for the "edit on github" link.
5. `/principles` — load `content/pages/principles.mdx`. The MDX file frontmatter contains an array of `{ heading, body }` items; the page renders the numbered grid from the wireframe.
6. `/about` — load `content/pages/about.mdx`. Plain prose.
7. Create placeholder MDX content for principles (6 items from the wireframe) and about (4 paragraphs from the wireframe).

**Acceptance criteria:**
- All 7 routes from `CLAUDE.md` render without errors.
- `/projects` filter persists across refresh (URL-driven).
- `/books` shows the correct count.
- Direct-link `/log/antifragile` works (and "edit on github" link, if wired, points at the right file).
- `pnpm build` produces all static pages successfully.

---

## Session 3 — Edit-on-github, sitemap, RSS, metadata

**Goal:** Wire up the "build in public" mechanics. After this session, the site can be deployed and shared.

**Tasks:**
1. **Edit-on-github links.** Pass `sourcePath` from MDX-backed routes down to `<Footer />`. Footer shows the link only when `sourcePath` is provided. URL pattern: `https://github.com/alexlauderbaugh/alexlauderbaugh.com/blob/main/${sourcePath}`.
2. **RSS feed.** Build `app/feed.xml/route.ts` returning RSS 2.0 XML for all non-draft log entries. Use absolute URLs from `NEXT_PUBLIC_SITE_URL`. Footer "RSS" link points here.
3. **Sitemap.** `app/sitemap.ts` returns all routes (homepage, log index, books, projects index, principles, about, every log entry, every project).
4. **robots.ts.** Allow all, include sitemap URL.
5. **Per-page metadata.** Implement `generateMetadata` on every route. Pattern: title is `{page} · Alex Lauderbaugh`, description pulled from frontmatter where applicable.
6. **Default OG image.** A simple 1200×630 PNG with the name in serif on the paper background. Static asset at `/public/og-default.png`. Use any image tool to make it; doesn't need to be fancy.

**Acceptance criteria:**
- Curl `/feed.xml` returns valid RSS with current log entries.
- `/sitemap.xml` lists every public URL.
- Right-click → View page source on `/log/antifragile` shows correct meta tags.
- Clicking "edit on github" on `/log/antifragile` opens the right file on GitHub (assumes repo is pushed; if not yet, point at the would-be URL).

---

## Session 4 — Deploy

**Goal:** Live at `alexlauderbaugh.com`.

**Tasks:**
1. **Initial commit + push to public GitHub repo.** Repo name: `alexlauderbaugh.com`. Ensure `.gitignore` is correct before first push — `/content/_drafts/`, `.env*`, `node_modules`, etc.
2. **Vercel project setup.** Connect the GitHub repo. Set `NEXT_PUBLIC_SITE_URL=https://alexlauderbaugh.com` in environment variables.
3. **Domain configuration.** Add `alexlauderbaugh.com` and `www.alexlauderbaugh.com` in Vercel. Configure DNS at the registrar (Vercel will tell you the exact records). Redirect `www` → apex.
4. **Vercel Analytics.** Enable in project settings. The script auto-injects, no code change needed.
5. **Smoke test in prod.**
   - Light and dark modes work.
   - All routes load.
   - RSS feed serves correctly.
   - Theme persists across navigation.
   - Mobile renders (320px to 1440px).
   - Lighthouse on mobile homepage: performance ≥ 90, accessibility ≥ 95.

**Acceptance criteria:**
- `https://alexlauderbaugh.com` loads the homepage.
- `https://www.alexlauderbaugh.com` redirects to apex.
- HTTPS is on, certificate valid.
- A second commit (e.g., a typo fix) deploys automatically.

---

## Session 5 — Real copy

**Goal:** Replace the wireframe's placeholder copy with Alex's real content. This is the session where Alex does most of the work and Claude Code is mostly editing files he points at.

**Inputs from Alex:**
- The real "where I am" line (current state).
- The real homepage intro paragraph.
- Final social URLs.
- A first batch of real log entries — recommend at least 2 build entries, 2 books, 1 note, 1 ship. Better with 8-10.
- Real project content for Syscribe, BJJ Map, and any athletic project he wants public.
- Real about-page paragraphs.
- Real principles (revise or replace the wireframe's 6).
- Confirm or change: email contact, GitHub handle, LinkedIn URL, Twitter/X handle.

**Tasks:**
1. Update `lib/site.ts` with real values.
2. Replace every placeholder MDX file in `/content/` with real content.
3. Replace placeholder project links (`#`, fake URLs) with real ones (or omit).
4. Take a real headshot photo decision: if including, add to about page only, sized appropriately. Otherwise skip.
5. Write a real `README.md` for the public repo. Brief: "Personal site for Alex Lauderbaugh. Built with Next.js + MDX. Source for alexlauderbaugh.com." Link to license.

**Acceptance criteria:**
- No `[TODO]`, `Lorem ipsum`, or placeholder URLs anywhere in committed content.
- Every project page reads like Alex wrote it.
- The about page is honest and current.
- The first log entries are publishable — Alex would be OK if a stranger screenshotted them tomorrow.

---

## After Session 5

The site is shipping and Alex can add to it by writing MDX files. From here, additions happen in single small commits — no further Claude Code sessions required for routine content updates.

**Things to add later (not in scope for v1, but worth tracking):**
- Per-post OG images (auto-generated via `@vercel/og`)
- A `/uses` page if Alex wants one
- A "now" view as a derived filter on `/log` (last 21 days)
- Plausible analytics if Vercel Analytics feels limiting
- Search across log entries (probably overkill until the archive is bigger)
