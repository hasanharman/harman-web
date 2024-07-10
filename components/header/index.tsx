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
    },
    {
      label: "Writings",
      href: "/writings",
    },
    {
      label: "Photos",
      href: "/photos",
    },
    {
      label: "Connect",
      href: "/connect",
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
      <div className={cn(fontClass, "text-sm md:text-base space-x-2 md:space-x-4")}>
        {MENU.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn("text-muted-foreground hover:text-black", {
              "text-accent-foreground": pathname === href,
            })}
          >
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}
