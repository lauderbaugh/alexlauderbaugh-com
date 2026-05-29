import type { Metadata } from "next";
import { LogEntryView } from "@/components/log-entry";
import { PageShell } from "@/components/page-shell";
import { getBooks } from "@/lib/content";
import { getBooksReadInYear } from "@/lib/goodreads";

export const metadata: Metadata = {
  title: "Books",
  description:
    "What I've been reading, with the running counter. The rating is a single signal: would I re-read it, would I skim it, would I pass.",
};

// Refresh the Goodreads read count once a day without a redeploy.
export const revalidate = 86400;

export default async function BooksPage() {
  const books = getBooks();
  const year = new Date().getFullYear();
  const readThisYear = (await getBooksReadInYear(year)) ?? books.length;

  return (
    <PageShell>
      <section className="pt-4 pb-8">
        <h1 className="serif text-[36px] font-medium tracking-tight">Books</h1>
        <p className="mt-3 text-[16px] leading-[1.7] text-muted dark:text-d-muted max-w-[58ch]">
          What I&apos;ve been reading, with the running counter. The rating is a
          single signal: would I re-read it, would I skim it, would I pass.
        </p>
        <p className="mt-4 mono text-[12px] text-accent dark:text-d-accent">
          {readThisYear} read this year
        </p>
      </section>

      <div className="divide-y divide-rule dark:divide-d-rule border-t border-rule dark:border-d-rule">
        {books.map((b) => (
          <LogEntryView key={b.slug} entry={b} />
        ))}
      </div>
    </PageShell>
  );
}
