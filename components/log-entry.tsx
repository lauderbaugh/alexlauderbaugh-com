import { formatDate } from "@/lib/github";
import type { LogEntry } from "@/lib/types";
import { TypeBadge } from "./type-badge";

interface LogEntryProps {
  entry: LogEntry;
  compact?: boolean;
}

function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function LogEntryView({ entry, compact = false }: LogEntryProps) {
  const paras = paragraphs(entry.body);
  const visible = compact ? paras.slice(0, 1) : paras;

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
            <span className="mono text-[11px] uppercase tracking-[0.14em] text-muted dark:text-d-muted">
              · {entry.project}
            </span>
          )}
        </div>
        <h3 className="serif text-[22px] font-medium leading-snug tracking-tight">
          {entry.title}
        </h3>
        {entry.author && (
          <p className="text-[14px] text-muted dark:text-d-muted mt-1">
            {entry.author}
            {entry.rating && (
              <span className="mono text-[12px] ml-3 text-accent dark:text-d-accent">
                ★ {entry.rating}
              </span>
            )}
          </p>
        )}
        <div className="prose-body mt-3 text-[16px] text-ink dark:text-d-ink max-w-[58ch]">
          {visible.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
