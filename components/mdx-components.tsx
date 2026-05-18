import NextLink from "next/link";
import type { ComponentProps } from "react";
import { SITE } from "@/lib/site";

function getSiteHostname(): string {
  try {
    return new URL(SITE.url).hostname;
  } catch {
    return "alexlauderbaugh.com";
  }
}

function isSameHost(url: URL): boolean {
  const site = getSiteHostname();
  return (
    url.hostname === site ||
    url.hostname === `www.${site}` ||
    `www.${url.hostname}` === site
  );
}

function MdxLink({ href = "", children, ...rest }: ComponentProps<"a">) {
  // Anchor links and mailto: plain anchor.
  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  // Root-relative: Next.js Link for client-side nav.
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <NextLink href={href} {...rest}>
        {children}
      </NextLink>
    );
  }
  // Absolute http(s): same-host → normalize to internal Link; external → new tab.
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      if (isSameHost(url)) {
        const internal = (url.pathname + url.search + url.hash) || "/";
        return (
          <NextLink href={internal} {...rest}>
            {children}
          </NextLink>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    } catch {
      // malformed URL — fall through to plain <a>
    }
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

// Suppress the MDX-level H1 (pages render their own) and route every MDX link
// through MdxLink so internal links use client-side nav and external links open
// safely in a new tab.
export const mdxComponents = {
  h1: () => null,
  a: MdxLink,
};
