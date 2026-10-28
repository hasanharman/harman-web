"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

// Clicks on a preview's own controls stay with the preview.
const INTERACTIVE =
  "a, button, input, select, textarea, label, [role=button], [role=switch], [role=slider], .cursor-grab";

/** A Lab card that opens its detail page when clicked anywhere outside the preview's controls. */
export function LabCard({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const down = useRef({ x: 0, y: 0 });

  return (
    <div
      className={cn("cursor-pointer", className)}
      onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
      onClick={(e) => {
        const dragged = Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 6;
        if (dragged || e.defaultPrevented || (e.target as Element).closest(INTERACTIVE)) return;
        if (e.metaKey || e.ctrlKey) window.open(href, "_blank");
        else router.push(href);
      }}
    >
      {children}
    </div>
  );
}
