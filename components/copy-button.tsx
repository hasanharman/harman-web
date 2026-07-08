"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

// Fallback for contexts where the async Clipboard API is blocked
// (insecure origins, sandboxed iframes): a hidden textarea + execCommand.
function legacyCopy(value: string) {
  if (typeof document === "undefined") return false;
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textArea);
  return ok;
}

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(
    async (value: string) => {
      if (!value || typeof window === "undefined") return;
      let ok = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value);
          ok = true;
        } catch {
          ok = legacyCopy(value);
        }
      } else {
        ok = legacyCopy(value);
      }
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      }
    },
    [timeout]
  );

  return { copied, copy };
}

interface CopyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      onClick={() => copy(value)}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 text-neutral-300 transition hover:bg-white/10 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30",
        className
      )}
      {...props}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
