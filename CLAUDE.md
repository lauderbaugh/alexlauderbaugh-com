# CLAUDE.md

Persistent context for working on alexlauderbaugh.com. Read this on every session.

---

## What this site is

A personal site for Alex Lauderbaugh — product leader and builder. Currently CPO at BettrData, solo-building Syscribe. Based in Auckland, NZ. The site presents a singular **builder** identity, audience-agnostic, optimized for two reader groups: investors evaluating Syscribe and senior hiring managers evaluating Alex.

Domain: `alexlauderbaugh.com`. Repo is public on GitHub.

Tone is **quietly opinionated** — confident, not loud; substantive, not minimal-for-the-sake-of-it. Inspired by Patrick Collison's typographic restraint, Andy Bell's piccalil.li project density, Karri Saarinen's quiet founder presence, and Lee Robinson's `/beliefs` page. Explicitly NOT Linear-style dark/gradient marketing aesthetic.

A wireframe `index.html` shipped first via claude.ai/design and lives in `/legacy/index.html` for reference. The Next.js port is the source of truth going forward.

---

## Stack

- **Next.js 15+ (App Router)** — RSC by default, no `'use client'` unless a component genuinely needs it (theme toggle, filter state).
- **MDX** via `@next/mdx` for content. Frontmatter parsed with `gray-matter`.
- **Tailwind v4** — matches the wireframe's utility-first approach.
- **`next-themes`** for light/dark mode toggle (avoids the SSR hydration flash).
- **TypeScript** throughout. Strict mode on.
- **`date-fns`** for date formatting in log entries.
- **Deployment: Vercel.** Custom domain `alexlauderbaugh.com`.
- **Analytics: Vercel Analytics** (free, integrates without adding scripts).

Do NOT add: shadcn/ui (overkill for this design), Framer Motion (the existing micro-animations are CSS), any CMS, any heavy dependency. The site is mostly typography and content files.

---

## Design language (extracted from the wireframe)

### Colors

Light mode:
- `paper` (background): `#FAFAF7`
- `ink` (primary text): `#1A1A1A`
- `muted` (secondary text): `#5A5A55`
- `rule` (borders/dividers): `#E6E4DC`
- `accent` (links, active states): `#2D4A3E` (deep forest)
- `accent-hover`: `#1F3329`

Dark mode:
- `d-bg`: `#16161A`
- `d-ink`: `#EDEAE3`
- `d-muted`: `#8A8780`
- `d-rule`: `#2A2A2E`
- `d-accent`: `#C5B4E3` (soft lilac)
- `d-accent-hover`: `#D6C9EC`

Accent color is used **sparingly**: links, "Building" status, active filter, the where-I-am dot, the running book counter, the type-dot in log entries. Nothing else.

### Typography

- **Serif** (headings, titles, book titles in lists): `Source Serif 4`, weight 500. Sentence case throughout — never Title Case, never ALL CAPS.
- **Sans** (body): `Inter`, weight 400 for body / 500 for emphasis. 16-17px body, line-height 1.7.
- **Mono** (dates, metadata, status labels, the where-line, "edit on github" link): `JetBrains Mono`, 11-13px. Used for texture, not decoration.
- Body prose: `max-width: 58ch` (roughly 640px). Wider feels like marketing copy.

Font loading: use `next/font/google` for all three. Don't reach for CDN `<link>` tags.

### Layout

- Single-column, `max-width: 720px`, generous horizontal padding (`px-6 sm:px-8`).
- Vertical rhythm via Tailwind spacing: sections separated by `mt-20`, no card containers or heavy dividers — whitespace and 0.5px rules do the work.
- Header: name on left (clickable, returns home), nav on right, then where-line below with accent dot.
- Footer: location + last-updated, social links inline with `·` separators, "edit on github" link.

### Micro-details that matter

These small things came from the wireframe and should NOT be lost in the port:

- `g + key` Vim-style global nav (`g h` home, `g l` log, `g b` books, `g p` projects, `g r` principles, `g a` about). Ignore inside inputs/textareas.
- The accent dot before the where-line in the header.
- Arrow links (`→`) that nudge right 2px on hover via `transform: translateX(2px)`.
- `::selection` color matches the accent (forest in light, lilac in dark).
- Focus rings in the accent color, 2px, 3px offset.
- `view-enter` keyframe animation on route change — `translateY(4px) → none` over 280ms. Respect `prefers-reduced-motion`.
- The numbered grid on `/principles`: `01`, `02`, `03` in mono, in a left column, with serif heading + body in the right column.

---

## Content model

All content lives in `/content/` as MDX files. The site is essentially a static site that renders these files.

### Directories

```
/content
  /log          — every log entry, one file per entry
  /projects     — one file per project
  /pages        — about, principles (single-page content)
```

### Log entry frontmatter

```yaml
---
title: "Syscribe · Week 5"
date: 2026-05-12
type: build              # build | book | note | ship
project: "Syscribe"      # build entries only
author: "Nassim Nicholas Taleb"   # book entries only
rating: "would re-read"  # book entries only: "would re-read" | "good" | "skim"
draft: false             # if true, hidden from feed
---
```

The body is regular MDX prose.

### Project frontmatter

```yaml
---
title: "Syscribe"
status: "Building"        # Building | Active | Shipped | Archived
category: "Software"      # Software | Athletics
summary: "AI-powered documentation that auto-generates from PR diffs and ships when humans approve."
weekMarker: "Week 5 of 12"   # optional, only when relevant
currentFocus:
  - "Reducing changelog noise: shipping a role-aware diff pipeline."
  - "Designing the human-in-the-loop review surface."
links:
  - label: "syscribe.dev"
    href: "https://syscribe.dev"
  - label: "Waitlist"
    href: "https://syscribe.dev/waitlist"
draft: false
---
```

Body is MDX. Use `### What's hard` and `### What I'm learning` style sub-headings.

### Sort/filter logic

- **Log feed**: reverse chronological by `date`. Filter by `type`. Hide `draft: true`.
- **Books page**: filter log to `type: book`, reverse chronological. Show running counter ("X read this year · Y total in 2026").
- **Projects index**: sort by status `[Building, Active, Shipped, Archived]`, then by most recent. Filter by `category` (`All / Software / Athletics`). Hide `draft: true`.
- **Homepage "Latest"**: single most recent log entry, any type.
- **Homepage "Building"**: the first `status: Building, category: Software` project. (Pan Pacs is Building/Athletics — it shouldn't take the homepage slot.)
- **Homepage "Recently read"**: three most recent `type: book` entries.

---

## Routing

```
/                    homepage
/log                 unified feed (?filter=build|book|note|ship)
/log/[slug]          single log entry permalink
/books               filtered log view, running counter
/projects            project index (?filter=software|athletics)
/projects/[slug]     single project page
/principles          numbered list
/about               about page
```

Use real URLs. No state-based pseudo-routing. Every page should be deep-linkable and shareable.

### Sitemap & feeds

- Generate `sitemap.xml` from the content tree.
- Generate `/feed.xml` (RSS) from all non-draft log entries.
- `robots.txt` — allow all.
- The footer "RSS" link points to `/feed.xml`.

---

## Conventions

### Drafts

Anything with `draft: true` in frontmatter is hidden from public views and feeds. Also hidden: anything inside `/content/_drafts/` (underscore-prefix folder is gitignored).

To draft something privately: create it in `/content/_drafts/`, work on it, move it to the real location when ready.

### "Edit this page on github"

Each page has a small footer link to the underlying `.md`/`.mdx` source. URL pattern:
`https://github.com/lauderbaugh/alexlauderbaugh-com/blob/main/content/log/syscribe-w5.mdx`

Pass the source file path to the layout/footer so the link is built per-page.

### Dates

Store as ISO `YYYY-MM-DD` in frontmatter. Display as `May 12, 2026` (use `date-fns` `format(d, 'MMM d, yyyy')`).

### Slugs

Filename = slug. `content/log/syscribe-w5.mdx` → `/log/syscribe-w5`. Keep slugs short, hyphenated, lowercase.

### Internal links in MDX

Author all internal links as absolute URLs using the canonical apex domain:

- ✅ `https://alexlauderbaugh.com/projects/syscribe`
- ❌ `/projects/syscribe`
- ❌ `https://www.alexlauderbaugh.com/projects/syscribe`

The MDX renderer (`components/mdx-components.tsx`) normalizes same-host absolute URLs to Next.js `<Link>` components for client-side navigation, so the user-facing behavior matches relative URLs. Authoring as absolute ensures links work in RSS feeds, syndicated content, and GitHub's MDX preview where there's no Next.js router to resolve a leading `/`.

External absolute URLs render as `<a target="_blank" rel="noopener noreferrer">`. `mailto:` and `#anchor` links render as plain anchors.

### Components

Component file naming: `kebab-case.tsx`. Import names PascalCase. Co-locate small components with the route that uses them; lift to `/components/` only when used in 2+ places.

The wireframe's components map to:
- `<LogEntry />` — used on `/log`, `/books`, homepage Latest section.
- `<TypeBadge />` — small dot + label for log entry types.
- `<FilterRow />` — used on `/log` and `/projects`.
- `<ArrowLink />` — the `→ Label` link pattern.
- `<Header />`, `<Footer />` — top-level layout.

### Tailwind tokens

Theme colors registered in `tailwind.config.ts` (or v4 CSS-first config). Always use the named tokens (`bg-paper`, `text-accent`, `dark:text-d-accent`) — never hardcoded hex.

---

## What NOT to commit

This repo is public. Treat every commit as published.

- **Secrets**: API keys, tokens, anything from `.env.local`. `.gitignore` covers `.env*` by default — keep it that way.
- **Real personal email addresses** beyond the public contact (`hi@alexlauderbaugh.com`). No family members' emails, no work-account addresses, no historic personal accounts.
- **Internal BettrData specifics**: customer names, pricing details, dashboard screenshots, competitive intel beyond what's already public. Keep BettrData project descriptions at the abstraction level of the current placeholder.
- **Unannounced Syscribe roadmap**: anything you wouldn't say on a sales call.
- **Anything you wouldn't want screenshotted**: if a sentence would be awkward in a screenshot tweeted by a stranger, it doesn't go in.
- **Draft posts**: use `/content/_drafts/` (gitignored) or `draft: true` frontmatter.

When in doubt, ask before committing.

---

## Commands

```bash
pnpm dev              # local dev server, port 3000
pnpm build            # production build
pnpm start            # serve production build locally
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
```

Pre-commit checklist (manual for now):
1. `pnpm typecheck` passes
2. `pnpm build` passes
3. No new files in `/content/_drafts/` are committed
4. No new `.env` files anywhere

---

## Working style

- **Small commits.** One logical change per commit. The git log is part of the "build in public" story.
- **Real placeholder content.** When you need filler, write something plausible — never `lorem ipsum`, never `[TODO]`. Alex will rewrite copy later; he needs to see the design rendered against realistic shapes.
- **Match the wireframe's voice.** The placeholder copy in `/legacy/index.html` is intentionally good — same register going forward.
- **Don't add features that weren't agreed on.** No view counts, no comment systems, no newsletter signup. If you think the site needs something, propose it first.

The wireframe is the design contract. The Next.js port should be functionally identical with three additions: real URLs, MDX-driven content, and "edit on github" links that work.
