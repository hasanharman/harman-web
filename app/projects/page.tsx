import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Hasan Harman - Projects",
  description:
    "I build things that I find interesting. Here are some of the projects I've worked on.",
};

const projects = [
  {
    title: "Shadcn Form Builder",
    description:
      "A dynamic form-building tool that allows users to create, customize, and validate forms seamlessly. Built with React, Next.js, shadcn/ui, React Hook Form, and Zod.",
    logo: "https://raw.githubusercontent.com/hasanharman/form-builder/main/assets/logo.svg",
    url: "https://www.shadcn-form.com/",
    github: "https://github.com/hasanharman/form-builder",
    stars: "2.7k",
    tech: ["Next.js", "React", "shadcn/ui", "Zod", "React Hook Form"],
  },
  {
    title: "Iso Middle Earth",
    description:
      "An isometric world-builder set in Tolkien's Middle-earth. Create and shape your own landscapes across 7 realms — Shire, Gondor, Mordor, Lothlórien, Rohan, Moria, and Rivendell — tile by tile.",
    logo: "https://isomiddleearth.com/logo.png",
    url: "https://isomiddleearth.com/",
    github: "https://github.com/hasanharman/isomiddleearth",
    stars: "321",
    tech: ["Next.js 16", "React 19", "Zustand", "Tailwind CSS"],
  },
  {
    title: "TrekDate",
    description:
      "Convert JavaScript dates to Star Trek: The Next Generation stardates — the same canonical system used across TNG, DS9, Voyager, Lower Decks, and Picard.",
    logo: "https://i.imgur.com/djIi5.png",
    url: "https://www.npmjs.com/package/trekdate",
    github: "https://github.com/hasanharman/trekdate",
    tech: ["JavaScript", "npm package"],
  },
];

export default function Projects() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-muted-foreground font-light">
        I build things that I find interesting. Here are some of the projects
        I&apos;ve worked on.
      </p>
      <hr />
      <div className="grid gap-6">
        {projects.map((project) => (
          <div
            key={project.title}
            className="group flex gap-4 items-start p-4 -mx-4 rounded-xl transition-colors hover:bg-muted/50"
          >
            <div className="flex-shrink-0 mt-1">
              <Image
                src={project.logo}
                alt={project.title}
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-contain"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{project.title}</h2>
                {project.stars && (
                  <span className="text-xs text-muted-foreground">
                    ⭐ {project.stars}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-light">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href={project.url}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm hover:underline underline-offset-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live
                </Link>
                <Link
                  href={project.github}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm hover:underline underline-offset-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
