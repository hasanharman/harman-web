import { Link } from "next-view-transitions";
import React from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface TocItem {
  title: string;
  url: string;
  items?: TocItem[];
}

interface TableOfContentsProps {
  tocList: TocItem[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ tocList }) => {
  const renderTocItems = (items: TocItem[], isSubItem: boolean = false) => {
    return items.map((item, index) => (
      <HoverCard key={index}>
        <HoverCardTrigger asChild>
          <div
            className={`${
              isSubItem ? "w-5" : "w-7"
            } flex flex-col items-end h-0.5 bg-slate-400 hover:bg-black rounded-xl my-1`}
          >
            {item.items && item.items.length > 0 && (
              <div className="mt-1.5 space-y-2">
                {renderTocItems(item.items, true)}
              </div>
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-fit p-3 space-y-2 ">
          <Link
            href={item.url}
            className="text-sm font-semibold no-underline hover:underline"
          >
            {item.title}
          </Link>
          {item.items && item.items.length > 0 && (
            <div className="flex flex-col ml-2 gap-1">
              {item.items.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  href={subItem.url}
                  className="text-xs no-underline hover:underline"
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    ));
  };

  return <div className="absolute right-1 px-1">{renderTocItems(tocList)}</div>;
};

export default TableOfContents;
