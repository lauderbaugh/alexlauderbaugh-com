import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getPrinciples } from "@/lib/content";

export const metadata: Metadata = {
  title: "Principles",
  description:
    "Things I believe about product, building, and showing up — held loosely enough to be wrong.",
};

export default function PrinciplesPage() {
  const principles = getPrinciples();
  if (!principles) notFound();

  const { frontmatter, sourcePath } = principles;

  return (
    <PageShell sourcePath={sourcePath}>
      <section className="pt-4 pb-10">
        <h1 className="serif text-[36px] font-medium tracking-tight">
          {frontmatter.title}
        </h1>
        {frontmatter.intro && (
          <p className="mt-3 text-[16px] leading-[1.7] text-muted dark:text-d-muted max-w-[58ch]">
            {frontmatter.intro}
          </p>
        )}
      </section>
      <ol className="space-y-10">
        {frontmatter.items.map((it, i) => (
          <li key={i} className="grid grid-cols-[40px_1fr] gap-6">
            <span className="mono text-[12px] pt-1.5 text-muted dark:text-d-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="serif text-[20px] font-medium leading-snug tracking-tight">
                {it.heading}
              </h3>
              <p className="mt-2 text-[16px] leading-[1.7] text-ink/90 dark:text-d-ink/90 max-w-[58ch]">
                {it.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
