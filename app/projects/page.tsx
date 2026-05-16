import Link from "next/link";
import { FilterRow } from "@/components/filter-row";
import { PageShell } from "@/components/page-shell";
import { getAllProjects } from "@/lib/content";
import { CATEGORIES, type ProjectCategory } from "@/lib/types";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "software", label: "Software" },
  { value: "athletics", label: "Athletics" },
];

function isCategoryFilter(v: string | undefined): v is Lowercase<ProjectCategory> {
  return (CATEGORIES as readonly string[])
    .map((c) => c.toLowerCase())
    .includes(v ?? "");
}

export default async function ProjectsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const projects = getAllProjects();
  const visible = isCategoryFilter(filter)
    ? projects.filter((p) => p.category.toLowerCase() === filter)
    : projects;

  return (
    <PageShell>
      <section className="pt-4 pb-8">
        <h1 className="serif text-[36px] font-medium tracking-tight">Projects</h1>
        <p className="mt-3 text-[16px] leading-[1.7] text-muted dark:text-d-muted max-w-[58ch]">
          Software and athletics, treated as peers. Each one has a deadline, an
          outcome that can be measured, and a plan that can be wrong.
        </p>
      </section>

      <div className="pb-2 border-b border-rule dark:border-d-rule">
        <FilterRow options={FILTER_OPTIONS} />
      </div>

      <div>
        {visible.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group block w-full text-left py-6 border-b border-rule dark:border-d-rule"
          >
            <div className="flex items-baseline justify-between gap-6 flex-wrap">
              <h3 className="serif text-[22px] font-medium tracking-tight group-hover:text-accent dark:group-hover:text-d-accent transition-colors">
                {project.title}
              </h3>
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted dark:text-d-muted">
                {project.status} · {project.category}
                {project.weekMarker && <span> · {project.weekMarker}</span>}
              </div>
            </div>
            <p className="text-[15px] mt-2 text-ink/85 dark:text-d-ink/85 max-w-[58ch]">
              {project.summary}
            </p>
            <span className="arrow-link inline-flex items-center gap-1.5 text-[13px] mt-3 text-accent dark:text-d-accent">
              <span className="arrow">→</span> Read more
            </span>
          </Link>
        ))}
        {visible.length === 0 && (
          <p className="py-12 text-[15px] text-muted dark:text-d-muted">
            Nothing here yet under this filter.
          </p>
        )}
      </div>
    </PageShell>
  );
}
