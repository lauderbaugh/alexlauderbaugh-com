// Suppress the leading H1 — pages provide their own <h1> via the layout chrome
// so the title doesn't render twice. h2 / h3 / ul / p / a all inherit styling
// from the parent .prose-body container in globals.css.
export const mdxComponents = {
  h1: () => null,
};
