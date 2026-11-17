import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

/**
 * A single cached Shiki highlighter, reused across every code block rendered at
 * build time. Themes match the article pipeline (velite/rehype-pretty-code) so
 * lab snippets and article code look identical.
 *
 * Built from `shiki/core` with only the languages and themes used here: the
 * full `shiki` bundle ships every grammar (~9 MB), which pushes the Cloudflare
 * Worker past the free plan's 3 MB limit.
 */
let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark.mjs")],
      langs: [
        import("shiki/langs/tsx.mjs"),
        import("shiki/langs/jsx.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/css.mjs"),
      ],
      engine: createOnigurumaEngine(import("shiki/wasm")),
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
