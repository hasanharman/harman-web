import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, BookOpen, ArrowUpRight, Package } from "lucide-react";

import { LAB_ITEMS } from "@/config/lab";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Hasan Harman - Lab",
  description:
    "A lab of interactive React components I've built — animations, motion, and small UI experiments.",
};

export default function Lab() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Lab</h1>
      <p className="text-muted-foreground font-light">
        A showcase of interactive components I&apos;ve built along the way —
        animations, motion experiments, and small UI pieces. Play with them
        below, then install any one with a single command.
      </p>
      <hr />
      <div className="grid gap-6 sm:grid-cols-2">
        {LAB_ITEMS.map((item) => (
          <div
            key={item.slug}
            className={`flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm ${
              item.fullWidth ? "sm:col-span-2" : ""
            }`}
          >
            <div
              className={`relative flex items-stretch justify-center ${
                item.previewClassName ?? ""
              }`}
            >
              {item.hint ? (
                <span className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-2 py-0.5 text-xs font-light text-white">
                  {item.hint}
                </span>
              ) : null}
              {item.preview}
            </div>
            <div className="flex flex-1 flex-col space-y-2 border-t p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                {item.installable ? (
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    <Package className="h-3 w-3" />
                    Installable
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm font-light text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
                {item.installable ? (
                  <Link
                    href={`/lab/${item.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline underline-offset-2"
                  >
                    View &amp; install
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
                {item.writing ? (
                  <Link
                    href={item.writing}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline underline-offset-2"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Read the writeup
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="pt-2 text-sm font-light text-muted-foreground">
        Want the source? Most of these live in my{" "}
        <Link
          href="https://github.com/hasanharman/harman-web"
          target="_blank"
          className="inline-flex items-center gap-1 hover:underline underline-offset-2"
        >
          website repo
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        .
      </p>
    </div>
  );
}
