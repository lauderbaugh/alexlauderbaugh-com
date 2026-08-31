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

// Refresh the Goodreads read count once a day without a redeploy.
export const revalidate = 86400;

export default async function BooksPage() {
  const books = getBooks();
  const year = new Date().getFullYear();
  const readThisYear = (await getBooksReadInYear(year)) ?? books.length;

  return (
    <PageShell>
      <PageIntro {...PAGE}>
        <p className="mt-4 mono text-[12px] text-accent dark:text-d-accent">
          {readThisYear} read this year
        </p>
      </PageIntro>

      <div className="divide-y divide-rule dark:divide-d-rule border-t border-rule dark:border-d-rule">
        {books.map((b) => (
          <LogEntryView key={b.slug} entry={b} />
        ))}
      </div>
    </PageShell>
  );
}
