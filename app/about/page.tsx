import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PageShell } from "@/components/page-shell";
import { getAboutPage } from "@/lib/content";

const mdxComponents = {
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props} />,
  a: ({ href = "#", ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props} />
  ),
};

export default function AboutPage() {
  const about = getAboutPage();
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
