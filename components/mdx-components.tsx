import { SmartLink } from "./smart-link";

// Suppress the MDX-level H1 (pages render their own from frontmatter.title).
// Route every MDX-authored link through SmartLink so internal links use
// client-side nav and external links open in a new tab.
export const mdxComponents = {
  h1: () => null,
  a: SmartLink,
};
