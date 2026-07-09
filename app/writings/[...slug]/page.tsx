import { posts } from "#site/content";
import { MDXContent } from "@/components/mdx-component";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { ArrowLeft } from "lucide-react";

import "@/styles/mdx.css";
import { Metadata } from "next";
import { siteConfig, ogImageUrl } from "@/config/site";
import { formatDate } from "@/lib/utils";
import TableOfContents from "@/components/table-of-contents";
import ScrollTracker from "@/components/scroll-tracker";

interface PostPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getPostFromParams(params: PostPageProps["params"]) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.join("/");
  const post = posts.find((post) => post.slugAsParams === slug);

  return post;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getPostFromParams(params);

  if (!post) {
    return {};
  }

  const og = ogImageUrl({
    title: post.title,
    label: "Writing",
    desc: post.description,
    meta: post.date ? formatDate(post.date) : undefined,
  });

  return {
    title: post.title,
    description: post.description,
    authors: { name: siteConfig.author },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: post.slug,
      images: [{ url: og, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [og],
    },
  };
}

export async function generateStaticParams(): Promise<
  { slug: string[] }[]
> {
  return posts.map((post: any) => ({ slug: post.slugAsParams.split("/") }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params);

  if (!post || !post.published) {
    notFound();
  }

  if (!post.body) {
    return null;
  }

  return (
    <article className="prose dark:prose-invert max-w-none">
      <Link
        href="/writings"
        className="not-prose mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Writings
      </Link>
      <h1 className="text-3xl font-semibold">{post?.title}</h1>
      {post.description ? (
        <p className="text-lg text-muted-foreground">{post.description}</p>
      ) : null}
      <hr className="my-4" />
      <TableOfContents tocList={post.toc} />
      <ScrollTracker />

      <MDXContent code={post.body} />
    </article>
  );
}
