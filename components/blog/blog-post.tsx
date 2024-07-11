import { MDXRemote } from "next-mdx-remote/rsc";
// import remarkGfm from "remark-gfm";
// import rehypeSlug from "rehype-slug";
// import rehypeAutolinkHeadings from "rehype-autolink-headings";
// import remarkA11yEmoji from "@fec/remark-a11y-emoji";
// import remarkToc from "remark-toc";
// import mdxComponents from "./MdxComponents";

export default function BlogPost({ children }: { children: string }) {
  return (
    <div className="prose prose-invert min-w-full">
      <MDXRemote
        source={children}
        // options={{
        //   mdxOptions: {
        //     remarkPlugins: [
        //       // Adds support for GitHub Flavored Markdown
        //       remarkGfm,
        //       // Makes emoji accessible ! adding aria-label
        //       remarkA11yEmoji,
        //       // generates a table of contents based on headings
        //       [remarkToc, { tight: true }],
        //     ],
        //     // These work together to add IDs and linkify headings
        //     rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        //   },
        // }}
        // components={mdxComponents}
      />
    </div>
  );
}
