import { formatDate } from "@/lib/utils";
import { Link } from "next-view-transitions";

import { IoIosArrowRoundForward } from "react-icons/io";

interface PostItemProps {
  slug: string;
  title: string;
  description?: string;
  date: string;
}

export function PostItem({ slug, title, description, date }: PostItemProps) {
  return (
    <Link href={"/" + slug} className="group">
      <article className="flex flex-col gap-2 border-border border-b p-3">
        <div className="flex justify-between items-center">
          <dl>
            <dt className="sr-only">Published On</dt>
            <dd className="text-xs font-medium text-muted-foreground">
              <time dateTime={date}>{formatDate(date)}</time>
            </dd>
          </dl>
          <IoIosArrowRoundForward className="text-muted-foreground text-xl transition-transform duration-300 group-hover:-rotate-45" />
        </div>
        <div>
          <h2 className="text-xl font-bold">
            <Link href={"/" + slug}>{title}</Link>
          </h2>
        </div>
        <div className="max-w-none text-muted-foreground">{description}</div>
      </article>
    </Link>
  );
}
