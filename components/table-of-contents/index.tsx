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

export default function TableOfContents({ tocList }: TableOfContentsProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="absolute right-1 space-y-2">
          {tocList.map((item, index) => (
            <div className="flex flex-col items-end space-y-2" key={item.title}>
              <div className="w-7 flex flex-col items-end h-0.5 bg-slate-400 hover:bg-black rounded-xl" />
              {item.items && item.items.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {item.items.map((subItem, subIndex) => (
                    <div
                      key={subItem.title}
                      className="w-5 flex flex-col items-end h-0.5 bg-slate-400 hover:bg-black rounded-xl"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit p-3 space-y-2 ">
        {tocList.map((item, index) => (
          <div className="space-y-2" key={item.title}>
            <Link
              href={item.url}
              className="text-sm no-underline hover:underline"
            >
              {item.title}
            </Link>
            {item.items && item.items.length > 0 && (
              <div className="flex flex-col space-y-2">
                {item.items.map((subItem, subIndex) => (
                  <Link
                    href={subItem.url}
                    key={subItem.title}
                    className="text-xs ml-3 no-underline hover:underline"
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}
