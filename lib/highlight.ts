import { createHighlighter, type Highlighter } from "shiki";

/**
 * A single cached Shiki highlighter, reused across every code block rendered at
 * build time. Themes match the article pipeline (velite/rehype-pretty-code) so
 * lab snippets and article code look identical.
 */
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["tsx", "jsx", "ts", "bash", "json", "css"],
    });
  }
  return highlighterPromise;
}

/** Highlight `code` to dual-theme HTML (light by default, dark under `.dark`). */
export async function highlightCode(code: string, lang = "tsx") {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  });
}
