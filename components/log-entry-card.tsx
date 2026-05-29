import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProject } from "@/lib/content";
import { formatDate } from "@/lib/github";
import { TYPE_LABEL, type LogEntry } from "@/lib/types";
import { mdxComponents } from "./mdx-components";

export function LogEntryCard({ entry }: { entry: LogEntry }) {
  const project = entry.project ? getProject(entry.project) : null;

  return (
    <article>
      <div className="mono text-[11px] tracking-[0.14em] text-muted dark:text-d-muted">
        {formatDate(entry.date)}
        <span className="uppercase"> · {TYPE_LABEL[entry.type]}</span>
        {entry.project && (
          <span>
            {" · "}
            {project ? (
              <Link
                href={`/projects/${project.slug}`}
                className="hover:text-ink dark:hover:text-d-ink transition-colors"
              >
                {project.title}
              </Link>
            ) : (
              entry.project
            )}
          </span>
        )}
        {entry.author && <span> · {entry.author}</span>}
        {entry.rating && <span> · {entry.rating}</span>}
      </div>
      <h3 className="serif text-[22px] font-medium leading-snug tracking-tight mt-3">
        {entry.title}
      </h3>
      <div className="prose-body mt-3 text-[16px] text-ink dark:text-d-ink max-w-[58ch]">
        <MDXRemote source={entry.body} components={mdxComponents} />
      </div>
    </article>
  );
}
