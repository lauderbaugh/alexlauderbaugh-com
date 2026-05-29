import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { PageShell } from "@/components/page-shell";
import { SmartLink } from "@/components/smart-link";
import { getAllLogEntries, getAllProjects, getProject } from "@/lib/content";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const hasLogEntries = getAllLogEntries().some((e) => e.project === project.slug);

  return (
    <PageShell sourcePath={project.sourcePath}>
      <Link
        href="/projects"
        className="arrow-link mono text-[12px] uppercase tracking-[0.14em] text-muted dark:text-d-muted hover:text-ink dark:hover:text-d-ink pt-2 mb-10 inline-flex items-center"
      >
        <span className="arrow inline-block rotate-180">→</span>
        <span className="ml-1">Projects</span>
      </Link>

      <header>
        <h1 className="serif text-[36px] font-medium tracking-tight leading-[1.1]">
          {project.title}
        </h1>
        <p className="mt-3 mono text-[12px] uppercase tracking-[0.14em] text-muted dark:text-d-muted">
          {project.status} · {project.category}
          {project.weekMarker && <span> · {project.weekMarker}</span>}
        </p>
        <p className="mt-4 text-[17px] leading-[1.7] text-ink dark:text-d-ink max-w-[58ch]">
          {project.summary}
        </p>
      </header>

      {project.currentFocus.length > 0 && (
        <aside className="mt-10 pl-5 border-l-2 border-accent dark:border-d-accent">
          <h2 className="mono text-[11px] uppercase tracking-[0.18em] text-accent dark:text-d-accent mb-2">
            {project.category === "Athletics" ? "Training block" : "Current focus"}
          </h2>
          <ul className="space-y-2 text-[15px] leading-[1.65] text-ink dark:text-d-ink max-w-[58ch]">
            {project.currentFocus.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </aside>
      )}

      <section className="prose-body mt-12 text-[17px] text-ink dark:text-d-ink max-w-[58ch]">
        <MDXRemote source={project.body} components={mdxComponents} />
      </section>

      {hasLogEntries && (
        <div className="mt-14 pt-6 border-t border-rule dark:border-d-rule">
          <Link
            href={`/log?project=${project.slug}`}
            className="arrow-link inline-flex items-center mono text-[12px] uppercase tracking-[0.14em] text-accent dark:text-d-accent hover:text-accent-hover dark:hover:text-d-accent-hover"
          >
            <span className="arrow">→</span>
            <span className="ml-1">All log entries for {project.title}</span>
          </Link>
        </div>
      )}

      {project.links.length > 0 && (
        <div className="mt-14 pt-6 border-t border-rule dark:border-d-rule">
          <h3 className="mono text-[11px] uppercase tracking-[0.18em] text-muted dark:text-d-muted mb-3">
            Links
          </h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
            {project.links.map((l) => (
              <li key={l.label}>
                <SmartLink
                  href={l.href}
                  className="arrow-link inline-flex items-center gap-1.5 text-accent dark:text-d-accent hover:text-accent-hover dark:hover:text-d-accent-hover"
                >
                  <span className="arrow">→</span>
                  {l.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageShell>
  );
}
