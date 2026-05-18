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

/**
 * Renders an anchor with smart routing:
 * - Root-relative ("/foo") or same-host absolute URL → Next.js Link (client-side nav).
 * - Cross-origin http(s) → <a target="_blank" rel="noopener noreferrer">.
 * - mailto:, tel:, #anchor, empty → plain <a> (same tab).
 *
 * Use this anywhere a content href could be either internal or external; it
 * keeps the "external links open in new tabs" rule applied consistently
 * across MDX bodies, footer, hero, project link lists, and ArrowLink.
 */
export function SmartLink({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (
    href === "" ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <NextLink href={href} {...rest}>
        {children}
      </NextLink>
    );
  }
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
