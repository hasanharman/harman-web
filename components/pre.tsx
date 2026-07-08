"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/components/copy-button";

type PreProps = React.HTMLAttributes<HTMLPreElement>;

export function Pre({ className, children, ...props }: PreProps) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border bg-muted/50">
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy code"}
        onClick={() => copy(preRef.current?.textContent ?? "")}
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-md border bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      <pre ref={preRef} className={cn("overflow-x-auto py-4", className)} {...props}>
        {children}
      </pre>
    </div>
  );
}
