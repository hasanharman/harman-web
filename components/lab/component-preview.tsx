"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/lab/code-block";

interface ComponentPreviewProps {
  preview: React.ReactNode;
  /** Raw code — used for copy and the plain fallback. */
  code: string;
  /** Server-highlighted Shiki HTML. */
  html?: string;
  hint?: string;
  previewClassName?: string;
}

/** Snippets longer than this collapse behind a "View Code" toggle. */
const COLLAPSE_AFTER_LINES = 12;

/**
 * A shadcn-style component demo: the live preview on top, its source stacked
 * below. Short snippets are shown in full; long ones collapse behind a
 * "View Code" toggle and scroll once expanded.
 */
export function ComponentPreview({
  preview,
  code,
  html,
  hint,
  previewClassName,
}: ComponentPreviewProps) {
  const [expanded, setExpanded] = React.useState(false);
  const collapsible = code.trim().split("\n").length > COLLAPSE_AFTER_LINES;

  return (
    <div className="overflow-hidden rounded-xl border">
      <div
        className={cn(
          "relative flex min-h-[360px] items-center justify-center overflow-hidden bg-card p-8",
          previewClassName
        )}
      >
        {hint ? (
          <span className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-2 py-0.5 text-xs font-light text-white">
            {hint}
          </span>
        ) : null}
        {preview}
      </div>

      <div className="relative border-t bg-muted/30">
        {collapsible ? (
          <>
            <div className={cn("relative", !expanded && "max-h-[140px] overflow-hidden")}>
              {/* Expanded: the CodeBlock's own ScrollArea caps height and scrolls. */}
              <CodeBlock
                code={code}
                html={html}
                bare
                maxHeight={expanded ? "480px" : "none"}
              />
              {!expanded ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
              ) : null}
            </div>
            <div className="flex justify-center border-t bg-background/60 py-2">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {expanded ? "Collapse" : "View Code"}
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    expanded && "rotate-180"
                  )}
                />
              </button>
            </div>
          </>
        ) : (
          <CodeBlock code={code} html={html} bare maxHeight="none" />
        )}
      </div>
    </div>
  );
}
