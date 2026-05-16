import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LogEntryView } from "@/components/log-entry";
import { PageShell } from "@/components/page-shell";
import { getAllLogEntries, getLogEntry } from "@/lib/content";

export function generateStaticParams() {
  return getAllLogEntries().map((e) => ({ slug: e.slug }));
}

function firstParagraph(body: string): string {
  return (body.split(/\n\s*\n/).map((p) => p.trim()).find(Boolean) ?? "").slice(0, 200);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLogEntry(slug);
  if (!entry) return { title: "Not found" };
  const description = firstParagraph(entry.body);
  return {
    title: entry.title,
    description,
  };
}

export default async function LogEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getLogEntry(slug);
  if (!entry) notFound();

  return (
    <PageShell sourcePath={entry.sourcePath}>
      <Link
        href="/log"
        className="arrow-link mono text-[12px] uppercase tracking-[0.14em] text-muted dark:text-d-muted hover:text-ink dark:hover:text-d-ink pt-2 mb-6 inline-flex items-center"
      >
        <span className="arrow inline-block rotate-180">→</span>
        <span className="ml-1">Log</span>
      </Link>
      <LogEntryView entry={entry} />
    </PageShell>
  );
}
