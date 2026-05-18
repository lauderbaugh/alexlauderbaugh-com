import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { PageShell } from "@/components/page-shell";
import { getStaticPage } from "@/lib/content";

const about = getStaticPage("about");

export const metadata: Metadata = about
  ? {
      title: about.frontmatter.title,
      description: about.frontmatter.description,
    }
  : { title: "About" };

export default function AboutPage() {
  if (!about) notFound();
  return (
    <PageShell sourcePath={about.sourcePath}>
      <section className="pt-4 pb-8">
        <h1 className="serif text-[36px] font-medium tracking-tight">
          {about.frontmatter.title}
        </h1>
      </section>
      <div className="prose-body text-[17px] text-ink dark:text-d-ink max-w-[58ch]">
        <MDXRemote source={about.body} components={mdxComponents} />
      </div>
    </PageShell>
  );
}
