export interface PageMeta {
  title: string;
  description?: string;
}

/**
 * The heading block at the top of a page. Takes the same object the route
 * exports as `metadata`, so the rendered copy and the meta tags can't drift.
 */
export function PageIntro({ title, description }: PageMeta) {
  return (
    <section className="pt-4 pb-8">
      <h1 className="serif text-[36px] font-medium tracking-tight">{title}</h1>
      {description && (
        <p className="mt-3 text-[16px] leading-[1.7] text-muted dark:text-d-muted max-w-[58ch]">
          {description}
        </p>
      )}
    </section>
  );
}
