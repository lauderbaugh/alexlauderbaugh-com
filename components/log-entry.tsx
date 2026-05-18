import { MDXRemote } from "next-mdx-remote/rsc";
import { formatDate } from "@/lib/github";
import type { LogEntry } from "@/lib/types";
import { mdxComponents } from "./mdx-components";
import { TypeBadge } from "./type-badge";

interface LogEntryProps {
  entry: LogEntry;
  compact?: boolean;
}

export function LogEntryView({ entry, compact = false }: LogEntryProps) {
  const visibleBody = compact
    ? (entry.body.split(/\n\s*\n/)[0] ?? "").trim()
    : entry.body;

  return (
    <article className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-x-8 gap-y-2 py-7">
      <div className="pt-1">
        <div className="mono text-[12px] text-muted dark:text-d-muted">
          {formatDate(entry.date)}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TypeBadge type={entry.type} />
          {entry.project && (
            <span className="mono text-[11px] tracking-[0.14em] text-muted dark:text-d-muted">
              · {entry.project}
            </span>
          )}
          {entry.rating && (
            <span className="mono text-[11px] tracking-[0.14em] text-muted dark:text-d-muted">
              · {entry.rating}
            </span>
          )}
        </div>
        <h3 className="serif text-[22px] font-medium leading-snug tracking-tight">
          {entry.title}
        </h3>
        {entry.author && (
          <p className="text-[14px] text-muted dark:text-d-muted mt-1">
            {entry.author}
          </p>
        )}
        <div className="prose-body mt-3 text-[16px] text-ink dark:text-d-ink max-w-[58ch]">
          <MDXRemote source={visibleBody} components={mdxComponents} />
        </div>
      </div>
    </article>
  );
}
