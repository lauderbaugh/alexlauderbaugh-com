import { MDXRemote } from "next-mdx-remote/rsc";
import { Fragment } from "react";
import { ArrowLink } from "@/components/arrow-link";
import { LogEntryCard } from "@/components/log-entry-card";
import { mdxComponents } from "@/components/mdx-components";
import { PageShell } from "@/components/page-shell";
import { Portrait } from "@/components/portrait";
import { SmartLink } from "@/components/smart-link";
import { getAllLogEntries, getAllProjects, getBooks } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function HomePage() {
  const entries = getAllLogEntries();
  const latest = entries[0];
  const recentBooks = getBooks().slice(0, 3);
  const projects = getAllProjects();
  const building =
    projects.find((p) => p.status === "Building" && p.category === "Software") ??
    projects.find((p) => p.status === "Building") ??
    projects[0];

  return (
    <PageShell>
      <section className="pt-6 pb-2">
        <div className="flex items-start gap-6 sm:gap-7">
          <div className="min-w-0 flex-1">
            <h1 className="serif text-[36px] sm:text-[38px] font-medium tracking-tight leading-[1.1]">
              {SITE.name}
            </h1>
            <p className="mono text-[12px] mt-2 text-muted dark:text-d-muted">
              Product leader · Builder · Auckland
            </p>
          </div>
          <Portrait size={112} shape="rounded" priority />
        </div>
        <p className="mt-7 text-[17px] leading-[1.7] text-ink dark:text-d-ink max-w-[58ch]">
          {SITE.intro}
        </p>
        <p className="mt-5 text-[14px] text-muted dark:text-d-muted">
          {SITE.social.slice(0, 4).map((s, i) => (
            <Fragment key={s.label}>
              {i > 0 && <span className="mx-1.5 text-rule dark:text-d-rule">·</span>}
              <SmartLink href={s.href} className="link hover:text-ink dark:hover:text-d-ink">
                {s.label}
              </SmartLink>
            </Fragment>
          ))}
        </p>
      </section>

      {latest && (
        <section className="mt-20">
          <h2 className="mono text-[11px] uppercase tracking-[0.18em] text-muted dark:text-d-muted mb-4">
            Latest
          </h2>
          <LogEntryCard entry={latest} />
          <ArrowLink href="/log" className="mt-3">
            More from the log
          </ArrowLink>
        </section>
      )}

      {building && (
        <section className="mt-20">
          <h2 className="mono text-[11px] uppercase tracking-[0.18em] text-muted dark:text-d-muted mb-4">
            Building
          </h2>
          <div className="flex items-baseline justify-between gap-6 flex-wrap">
            <h3 className="serif text-[24px] font-medium tracking-tight">
              {building.title}
            </h3>
            <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted dark:text-d-muted">
              {building.status} · {building.category}
              {building.weekMarker && <span> · {building.weekMarker}</span>}
            </div>
          </div>
          <p className="text-[16px] mt-3 leading-[1.7] text-ink dark:text-d-ink max-w-[58ch]">
            {building.summary} A small team of one, shipping in public against a twelve-week clock.
          </p>
          <ArrowLink href={`/projects/${building.slug}`} className="mt-3">
            {building.title}
          </ArrowLink>
        </section>
      )}

      {recentBooks.length > 0 && (
        <section className="mt-20">
          <h2 className="mono text-[11px] uppercase tracking-[0.18em] text-muted dark:text-d-muted mb-4">
            Recently read
          </h2>
          <ul className="divide-y divide-rule dark:divide-d-rule border-t border-b border-rule dark:border-d-rule">
            {recentBooks.map((b) => (
              <li key={b.slug} className="py-4">
                <div className="flex items-baseline justify-between gap-6 flex-wrap">
                  <div>
                    <span className="serif text-[18px] font-medium">{b.title}</span>
                    {b.author && (
                      <span className="text-[14px] text-muted dark:text-d-muted ml-2">
                        {b.author}
                      </span>
                    )}
                  </div>
                  {b.rating && (
                    <span className="mono text-[12px] text-muted dark:text-d-muted">
                      {b.rating}
                    </span>
                  )}
                </div>
                <div className="prose-body text-[15px] mt-1.5 text-ink/85 dark:text-d-ink/85 max-w-[58ch]">
                  <MDXRemote
                    source={(b.body.split(/\n\s*\n/)[0] ?? "").trim()}
                    components={mdxComponents}
                  />
                </div>
              </li>
            ))}
          </ul>
          <ArrowLink href="/books" className="mt-4">
            All books
          </ArrowLink>
        </section>
      )}
    </PageShell>
  );
}
