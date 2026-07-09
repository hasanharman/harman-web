"use client";

import * as React from "react";
import { File } from "lucide-react";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

interface CodeBlockProps {
  /** Raw code — used for the copy button. */
  code: string;
  /** Server-highlighted Shiki HTML. Falls back to plain text when absent. */
  html?: string;
  /** Optional filename shown in a header bar. */
  filename?: string;
  className?: string;
  showLineNumbers?: boolean;
  /** Max height before the block scrolls. Defaults to a roomy 24rem. */
  maxHeight?: string;
  /** Drop the outer border/background — used when embedded in ComponentPreview. */
  bare?: boolean;
}

export function CodeBlock({
  code,
  html,
  filename,
  className,
  showLineNumbers = true,
  maxHeight = "24rem",
  bare = false,
}: CodeBlockProps) {
  return (
    <div
      className={cn(
        "relative",
        !bare && "overflow-hidden rounded-lg border bg-muted/30",
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
          className="absolute right-2 top-2 z-10 size-8 border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        />
      )}
      <div
        className="w-full overflow-auto"
        style={maxHeight && maxHeight !== "none" ? { maxHeight } : undefined}
      >
        {html ? (
          <div
            className={cn(
              "code-shiki",
              showLineNumbers && "with-line-numbers"
            )}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed">
            <code className="font-mono">{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
