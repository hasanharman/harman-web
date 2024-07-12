import { posts } from "#site/content";
import { PostItem } from "@/components/post-item";
import { QueryPagination } from "@/components/query-pagination";
import { sortPosts } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hasan Harman - Writings",
  description:
    "I write about things I learn, things I build, and things I think about. I hope you find something useful here.",
};

const POSTS_PER_PAGE = 5;

interface BlogPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const sortedPosts = sortPosts(posts.filter((post) => post.published));
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);

  const displayPosts = sortedPosts.slice(
    POSTS_PER_PAGE * (currentPage - 1),
    POSTS_PER_PAGE * currentPage
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Writings</h1>
      <p className="text-muted-foreground font-light">
        I write about things I learn, things I build, and things I think about.
        I hope you find something useful here.
      </p>
      <div className="">
        <hr />
        {displayPosts?.length > 0 ? (
          <ul className="flex flex-col">
            {displayPosts.map((post) => {
              const { slug, date, title, description } = post;
              return (
                <li key={slug}>
                  <PostItem
                    slug={slug}
                    date={date}
                    title={title}
                    description={description}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Nothing to see here yet</p>
        )}
        <QueryPagination totalPages={totalPages} className="justify-end mt-4" />
      </div>
    </div>
  );
}
