import type { Metadata } from "next";
import { FilterRow } from "@/components/filter-row";
import { LogEntryView } from "@/components/log-entry";
import { PageShell } from "@/components/page-shell";
import { getAllLogEntries } from "@/lib/content";
import { LOG_TYPES, type LogType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Log",
  description:
    "The things I'm currently writing, building, reading, and shiping. Reverse chronological.",
};

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "build", label: "Building" },
  { value: "book", label: "Books" },
  { value: "note", label: "Notes" },
  { value: "ship", label: "Ships" },
];

function isLogType(v: string | undefined): v is LogType {
  return (LOG_TYPES as readonly string[]).includes(v ?? "");
}

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const entries = getAllLogEntries();
  const visible = isLogType(filter) ? entries.filter((e) => e.type === filter) : entries;

  return (
    <PageShell>
      <section className="pt-4 pb-8">
        <h1 className="serif text-[36px] font-medium tracking-tight">Log</h1>
        <p className="mt-3 text-[16px] leading-[1.7] text-muted dark:text-d-muted max-w-[58ch]">
          Everything I write, build, read, and ship. Reverse chronological, no
          categories that aren't earned.
        </p>
      </section>

      <div className="pb-2 border-b border-rule dark:border-d-rule">
        <FilterRow options={FILTER_OPTIONS} />
      </div>

      <div className="divide-y divide-rule dark:divide-d-rule">
        {visible.length === 0 ? (
          <p className="py-12 text-[15px] text-muted dark:text-d-muted">
            Nothing here yet under this filter.
          </p>
        ) : (
          visible.map((entry) => <LogEntryView key={entry.slug} entry={entry} />)
        )}
      </div>
    </PageShell>
  );
}
