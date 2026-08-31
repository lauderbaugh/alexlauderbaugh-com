import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { PageIntro, type PageMeta } from "@/components/page-intro";
import { PageShell } from "@/components/page-shell";
import { getStaticPage } from "@/lib/content";

const principles = getStaticPage("principles");

const PAGE: PageMeta = principles
  ? {
      title: principles.frontmatter.title,
      description: principles.frontmatter.description,
    }
  : { title: "Principles" };

export const metadata: Metadata = PAGE;

export default function PrinciplesPage() {
  if (!principles) notFound();
  return (
    <PageShell sourcePath={principles.sourcePath}>
      <PageIntro {...PAGE} />
      <div className="pt-7 border-t border-rule dark:border-d-rule">
        <div className="prose-body text-[17px] text-ink dark:text-d-ink max-w-[58ch]">
          <MDXRemote source={principles.body} components={mdxComponents} />
        </div>
      </div>
    </PageShell>
  );
}
