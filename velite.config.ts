import { defineConfig, defineCollection, s } from "velite";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// Turn on line numbers for every highlighted code block by adding the
// `data-line-numbers` attribute rehype-pretty-code leaves off. The matching
// counter CSS already lives in styles/mdx.css. Runs after rehype-pretty-code.
function rehypeCodeLineNumbers() {
  const walk = (node: any, parent: any) => {
    if (
      node.type === "element" &&
      node.tagName === "code" &&
      parent?.tagName === "pre" &&
      node.properties?.["data-language"]
    ) {
      node.properties["data-line-numbers"] = "";
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child, node);
    }
  };
  return (tree: any) => walk(tree, null);
}

const computedFields = <T extends { slug: string }>(data: T) => ({
  ...data,
  slugAsParams: data.slug.split("/").slice(1).join("/"),
});

const posts = defineCollection({
  name: "Post",
  pattern: "writings/**/*.mdx",
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      description: s.string().max(999).optional(),
      date: s.isodate(),
      published: s.boolean().default(true),
      toc: s.toc(),
      body: s.mdx(),
    })
    .transform(computedFields),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          // Dual theme: light by default, dark under the `.dark` class.
          // keepBackground:false lets the <Pre> card control the background.
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
        },
      ],
      rehypeCodeLineNumbers,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
    remarkPlugins: [],
  },
});
