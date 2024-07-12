"use client";

import React from "react";
import { Link } from "next-view-transitions";
import { Pacifico } from "next/font/google";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const pacifico = Pacifico({
  weight: "400",
  display: "swap",
  subsets: ["latin-ext"],
  preload: true,
});

interface HeaderProps {
  fontClass: string;
}

export default function Header({ fontClass }: HeaderProps) {
  const pathname = usePathname();

  const MENU = [
    {
      label: "Projects",
      href: "/projects",
      isDisabled: true,
    },
    {
      label: "Writings",
      href: "/writings",
      isDisabled: false,
    },
    {
      label: "Photos",
      href: "/photos",
      isDisabled: false,
    },
    {
      label: "Connect",
      href: "/connect",
      isDisabled: false,
    },
  ];

  return (
    <header className="flex justify-between items-center">
      <Link
        href="/"
        className={cn("text-xl hover:text-slate-700", {
          [pacifico.className]: true,
        })}
      >
        Hasan Harman
      </Link>
      <div
        className={cn(fontClass, "text-sm md:text-base space-x-2 md:space-x-4")}
      >
        {MENU.map(({ label, href, isDisabled }) => (
          <Link
            key={href}
            href={href}
            className={cn("text-muted-foreground hover:text-black", {
              "text-accent-foreground": pathname === href,
              "pointer-events-none": isDisabled,
            })}
          >
            <Button variant="link" className="p-0" disabled={isDisabled}>
              {label}
            </Button>
          </Link>
        ))}
      </div>
    </header>
  );
}
