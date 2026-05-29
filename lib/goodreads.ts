import "server-only";

const GOODREADS_USER_ID = "69418981";

// Per-shelf RSS feed (the Goodreads public API was retired in 2020). Sorted by
// date read, descending, so the current year's reads sit at the top of the feed.
const READ_SHELF_RSS = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=read&sort=date_read&order=d&per_page=200`;

// Counts books whose "date read" on Goodreads falls in the given year. Books
// marked read without a date are not counted (Goodreads leaves user_read_at
// empty for those). Returns null on any fetch/parse failure so callers can fall
// back gracefully.
export async function getBooksReadInYear(year: number): Promise<number | null> {
  try {
    const res = await fetch(READ_SHELF_RSS, {
      headers: { "User-Agent": "alexlauderbaugh.com" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const xml = await res.text();
    // Values are CDATA-wrapped, e.g. <user_read_at><![CDATA[Tue, 26 May 2026 ...]]></user_read_at>
    const matches = xml.matchAll(
      /<user_read_at>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/user_read_at>/g,
    );

    let count = 0;
    for (const [, value] of matches) {
      const readAt = new Date(value.trim());
      if (!Number.isNaN(readAt.getTime()) && readAt.getFullYear() === year) {
        count += 1;
      }
    }
    return count;
  } catch {
    return null;
  }
}
