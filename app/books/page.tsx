import type { Metadata } from "next";
import { LogEntryView } from "@/components/log-entry";
import { PageIntro, type PageMeta } from "@/components/page-intro";
import { PageShell } from "@/components/page-shell";
import { getBooks } from "@/lib/content";
import { getBooksReadInYear } from "@/lib/goodreads";

const PAGE: PageMeta = {
  title: "Books",
  description: "What I've been reading, with the running counter.",
};

export const metadata: Metadata = PAGE;

// Pick up the synced Goodreads count hourly without a redeploy.
export const revalidate = 3600;

export default async function BooksPage() {
  const books = getBooks();
  const year = new Date().getFullYear();
  // null → no trustworthy count; hide the number rather than show a wrong one.
  const readThisYear = await getBooksReadInYear(year);

  return (
    <PageShell>
      <PageIntro {...PAGE} />

      <div className="pb-2 border-b border-rule dark:border-d-rule">
        <p className="mono text-[12px] tracking-[0.14em] text-accent dark:text-d-accent">
          {readThisYear === null ? " " : `${readThisYear} read this year`}
        </p>
      </div>

      <div className="divide-y divide-rule dark:divide-d-rule">
        {books.map((b) => (
          <LogEntryView key={b.slug} entry={b} />
        ))}
      </div>
    </PageShell>
  );
}
