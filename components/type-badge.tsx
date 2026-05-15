import { TYPE_LABEL, type LogType } from "@/lib/types";

export function TypeBadge({ type }: { type: LogType }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="type-dot bg-accent dark:bg-d-accent" aria-hidden="true" />
      <span className="mono text-[11px] uppercase tracking-[0.14em] text-muted dark:text-d-muted">
        {TYPE_LABEL[type]}
      </span>
    </span>
  );
}
