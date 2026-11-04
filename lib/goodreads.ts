import "server-only";

// Goodreads retired its public shelf RSS (and put shelf pages behind sign-in)
// in 2026, so the count can't be fetched from here any more. Instead a local
// job (scripts/goodreads-sync.mjs, run by launchd on Alex's laptop) reads the
// signed-in shelf and writes the result to a Vercel Global Config item. This
// module only reads that item.

export const GOODREADS_ITEM_KEY = "goodreadsReadCount";

type ReadCount = { year: number; count: number; updatedAt: string };

// Global Config connection string, e.g.
// https://edge-config.vercel.com/ecfg_xxx?token=yyy
function itemUrl(): string | null {
  const conn = process.env.GLOBAL_CONFIG ?? process.env.EDGE_CONFIG;
  if (!conn) return null;
  try {
    const url = new URL(conn);
    url.pathname = `${url.pathname.replace(/\/$/, "")}/item/${GOODREADS_ITEM_KEY}`;
    return url.toString();
  } catch {
    return null;
  }
}

// Returns the number of books read on Goodreads in `year`, or null when the
// stored value is missing, unreadable, or for a different year (e.g. the
// laptop hasn't synced since New Year). Callers should hide the counter on null.
export async function getBooksReadInYear(year: number): Promise<number | null> {
  const url = itemUrl();
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<ReadCount> | null;
    if (data?.year !== year || typeof data.count !== "number") return null;
    return data.count;
  } catch {
    return null;
  }
}
