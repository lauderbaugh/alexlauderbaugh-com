import { getAllLogEntries } from "@/lib/content";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function paragraphsToHtml(body: string): string {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${xmlEscape(p)}</p>`)
    .join("");
}

export function GET() {
  const base = SITE.url;
  const entries = getAllLogEntries();

  const lastBuild =
    entries[0]?.date ? new Date(entries[0].date).toUTCString() : new Date().toUTCString();

  const items = entries
    .map((e) => {
      const url = `${base}/log/${e.slug}`;
      const pubDate = new Date(e.date).toUTCString();
      const description = paragraphsToHtml(e.body);
      const author =
        e.type === "book" && e.author ? `<dc:creator><![CDATA[${e.author}]]></dc:creator>` : "";
      return `    <item>
      <title>${xmlEscape(e.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${xmlEscape(e.type)}</category>
      ${author}
      <description><![CDATA[${description}]]></description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEscape(SITE.name)}</title>
    <link>${base}</link>
    <description>${xmlEscape(SITE.intro)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
