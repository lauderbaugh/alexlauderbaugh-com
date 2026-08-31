import type { ReactNode } from "react";

export interface PageMeta {
  title: string;
  description?: string;
}

interface PageIntroProps extends PageMeta {
  children?: ReactNode;
}

/**
 * The heading block at the top of a page. Takes the same object the route
 * exports as `metadata`, so the rendered copy and the meta tags can't drift.
 */
export function PageIntro({ title, description, children }: PageIntroProps) {
  return (
    <section className="pt-4 pb-8">
      <h1 className="serif text-[36px] font-medium tracking-tight">{title}</h1>
      {description && (
        <p className="mt-3 text-[16px] leading-[1.7] text-muted dark:text-d-muted max-w-[58ch]">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}
