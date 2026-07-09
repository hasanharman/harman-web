"use client";

import * as React from "react";
import { File } from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyButton } from "@/components/copy-button";

interface CodeBlockProps {
  code: string;
  /** Optional filename shown in a header bar, e.g. "components/vinyl-record/index.tsx". */
  filename?: string;
  language?: string;
  className?: string;
  /** Max height before the block scrolls. Defaults to a roomy 24rem. */
  maxHeight?: string;
}

export function CodeBlock({
  code,
  filename,
  language = "tsx",
  className,
  maxHeight = "24rem",
}: CodeBlockProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-muted/30",
        className
      )}
    >
      {filename ? (
        <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
          <File className="size-3.5" />
          <span className="font-mono">{filename}</span>
          <CopyButton
            value={code}
            className="ml-auto size-7 border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          />
        </div>
      ) : (
        <CopyButton
          value={code}
          className="absolute right-3 top-3 z-10 size-8 border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        />
      )}
      <ScrollArea style={{ maxHeight }} className="w-full">
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="font-mono" data-language={language}>
            {code}
          </code>
        </pre>
      </ScrollArea>
    </div>
  );
}
