import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { PageShell } from "@/components/page-shell";
import { getStaticPage } from "@/lib/content";

const principles = getStaticPage("principles");

export const metadata: Metadata = principles
  ? {
      title: principles.frontmatter.title,
      description: principles.frontmatter.description,
    }
  : { title: "Principles" };

export default function PrinciplesPage() {
  if (!principles) notFound();
  return (
    <PageShell sourcePath={principles.sourcePath}>
      <section className="pt-4 pb-8">
        <h1 className="serif text-[36px] font-medium tracking-tight">
          {principles.frontmatter.title}
        </h1>
      </section>
      <div className="prose-body text-[17px] text-ink dark:text-d-ink max-w-[58ch]">
        <MDXRemote source={principles.body} components={mdxComponents} />
      </div>
    </PageShell>
  );
}
