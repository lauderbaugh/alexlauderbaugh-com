import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { PageIntro, type PageMeta } from "@/components/page-intro";
import { PageShell } from "@/components/page-shell";
import { getStaticPage } from "@/lib/content";

const about = getStaticPage("about");

const PAGE: PageMeta = about
  ? {
      title: about.frontmatter.title,
      description: about.frontmatter.description,
    }
  : { title: "About" };

export const metadata: Metadata = PAGE;

export default function AboutPage() {
  if (!about) notFound();
  return (
    <PageShell sourcePath={about.sourcePath}>
      <PageIntro title={PAGE.title} />
      <div className="prose-body text-[17px] text-ink dark:text-d-ink max-w-[58ch]">
        <MDXRemote source={about.body} components={mdxComponents} />
      </div>
    </PageShell>
  );
}
