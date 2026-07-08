"use client";

import Image from "next/image";
import Link from "next/link";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

import SocialMediaButtons from "@/components/social-media-buttons";
import WorldClocks from "@/components/world-clocks";
import PhotoFrames from "@/components/photo-frames";

import Avatar from "@/assets/avatar.webp";
import SightImage from "@/assets/sight.webp";
import HomeImage from "@/assets/home.webp";
import HabitImage from "@/assets/habit.webp";
import AstroImage from "@/assets/astro.webp";
import HostbotLogo from "@/assets/companies/hb.jpg";
import ClupLogo from "@/assets/companies/clup.png";
import Pacemaker from "@/assets/companies/pacemaker.jpg";

export default function Home() {
  const images = [SightImage, HabitImage, HomeImage, AstroImage];

  const projects = [
    {
      title: "Shadcn Form Builder",
      company: "shadcn-form.com",
      date: "09-2024",
      description:
        "I made building forms faster for shadcn & react hook form and zod.",
      logo: "https://raw.githubusercontent.com/hasanharman/form-builder/main/assets/logo.svg",
      url: "https://www.shadcn-form.com/",
      github: "https://github.com/hasanharman/form-builder",
      isRounded: true,
      isSquare: true,
      isTransparent: true,
    },
    {
      title: "Iso Middle Earth",
      company: "isomiddleearth.com",
      date: "2026",
      description:
        "An isometric world-builder set in Tolkien's Middle-earth. Create and shape your own landscapes across 7 realms, tile by tile.",
      logo: "https://isomiddleearth.com/logo.png",
      url: "https://isomiddleearth.com/",
      github: "https://github.com/hasanharman/isomiddleearth",
      isRounded: true,
      isSquare: true,
      isTransparent: true,
    },
    {
      title: "TrekDate",
      company: "npm package",
      date: "2026",
      description:
        "Convert JavaScript dates to Star Trek: TNG stardates — the same system used by Captain Jean-Luc Picard.",
      logo: "https://i.imgur.com/djIi5.png",
      url: "https://www.npmjs.com/package/trekdate",
      github: "https://github.com/hasanharman/trekdate",
      isRounded: true,
      isSquare: true,
      isTransparent: true,
    },
    {
      title: "Open Timer",
      company: "macOS app",
      date: "2026",
      description:
        "A minimal macOS menubar app to track freelance work sessions with projects, summaries, and local-only storage.",
      logo: "https://raw.githubusercontent.com/hasanharman/opentimer/main/screenshots/logo.png",
      url: "https://opentimer.vercel.app/",
      github: "https://github.com/hasanharman/opentimer",
      isRounded: true,
      isSquare: true,
      isTransparent: true,
    },
    {
      title: "OpenSS",
      company: "macOS app",
      date: "2026",
      description:
        "A minimal macOS menu bar app for long screenshots. Pick a window, auto-scroll to the end, and save one clean PNG.",
      logo: "https://raw.githubusercontent.com/hasanharman/open-ss/main/website/public/icon.png",
      url: "https://open-ss.vercel.app/",
      github: "https://github.com/hasanharman/open-ss",
      isRounded: true,
      isSquare: true,
      isTransparent: true,
    },
  ];

  const experiences = [
    {
      title: "Frontend Developer",
      company: "OneUp",
      date: "Dec 2025 - Today",
      description:
        "I work on generative AI and product interfaces at OneUp, building conversational tools that help SMBs manage their financial documents more easily.",
      logo: "/oneup.svg",
      url: "https://www.oneup.com/",
      isRounded: true,
      isSquare: false,
      isTransparent: false,
    },
    {
      title: "Frontend Developer & Director",
      company: "Hostbot Inc.",
      date: "2023 - Today",
      description:
        "Hostbot is the first property management software in Turkey. I'm responsible for the technical frontend architecture and development of the project. We developed this system with Nextjs Tailwindcss and server actions.",
      logo: HostbotLogo,
      url: "https://www.hostbot.app/",
      isRounded: false,
      isSquare: false,
      isTransparent: false,
    },
    {
      title: "Frontend Developer",
      company: "Clup.com",
      date: "2023 - 2024",
      description:
        "I was responsible for writing reusable components with Nextjs and establishing the frontend structure of the project. I personally developed the user profile, messaging and payment steps using Stripe.",
      logo: ClupLogo,
      url: "https://clup.com/",
      isRounded: false,
      isSquare: true,
      isTransparent: false,
    },
    {
      title: "Full Stack Developer",
      company: "Closar",
      date: "2022 - 2023",
      description:
        "Closar is an AR company focused on the houses. I help them create website starting with Angular then we moved to react. My main contribution here is to designing and coding the onboarding part specially. I have used Firebase v9 for Database, Storage, Authentication and Functions. Then I create a digital guide for home owners.",
      logo: "https://i.pinimg.com/originals/8e/03/cc/8e03cca348047dee0314bdc04c3079ad.png",
      url: "https://closar.com/",
      isRounded: false,
      isSquare: false,
      isTransparent: false,
    },
    {
      title: "Frontend Developer",
      company: "Pacemaker Inc.",
      date: "2021 - 2022",
      description:
        "Pacemaker is a multidisciplinary digital agency. I initially joined Pacemaker as a frontend developer and successfully progressed to the role of a full-stack developer over the years. During my tenure at Pacemaker, I contributed to nearly 20 projects within a span of 2 years. In my final 6 months, I assumed the additional responsibility of managing the development team.",
      logo: Pacemaker,
      url: "https://pacemaker.com.tr/",
      isRounded: true,
      isSquare: true,
      isTransparent: true,
    },
    {
      title: "Software Developer (Intern)",
      company: "Vestel",
      date: "2020 - 2021",
      description:
        "My involvement in developing a portable game console for Vestel phones led to a job offer directly from Vestel. Initially, I primarily focused on smart home applications, where I specialized in crafting user interfaces using Swift. Subsequently, following a departmental transition, I took on the task of coding a dial test simulator for electric cars.",
      logo: "https://statics.vestel.com.tr/contents/images/archive/vestel-kirmizi-logo-buyuk1(1).png",
      url: "https://www.vestel.com.tr/",
      isRounded: true,
      isSquare: true,
      isTransparent: true,
    },
  ];

  return (
    <section>
      {/* Introduction section */}
      <div className="flex flex-col justify-center items-center text-center space-y-5">
        <Image
          src={Avatar}
          alt="Hasan Harman"
          width="64"
          height="64"
          className="w-16 h-16 rounded-full border-4"
        />
        <h2 className="text-2xl font-semibold">Hasan Harman</h2>
        <p className="text-muted-foreground ">
          Curious engineer & Frontend developer from Mersin 🌴 🇹🇷
        </p>
        <WorldClocks />
        <SocialMediaButtons />
        <PhotoFrames images={images} />
      </div>
      {/* Experience section */}
      <h3 className="text-lg font-semibold mt-10 mb-5">Experiences</h3>
      <div className="hidden md:flex items-center gap-3">
        {experiences.map((item, id) => (
          <HoverCard key={id}>
            <Link href={item.url} target="_blank">
              <HoverCardTrigger asChild>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-card transition-colors hover:border-foreground/30">
                  <Image
                    src={item.logo}
                    alt={item.company}
                    width="80"
                    height="80"
                    className={cn(
                      "h-10 w-10 object-contain transition-transform duration-150 hover:scale-110",
                      item.isRounded && "rounded-lg",
                      // monochrome dark line-art logo (form-builder) — invert it
                      // in dark mode so it isn't lost on the dark tile.
                      typeof item.logo === "string" &&
                        item.logo.includes("form-builder") &&
                        "dark:invert"
                    )}
                  />
                </div>
              </HoverCardTrigger>
            </Link>
            <HoverCardContent className="w-72 p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl ring-1 ring-black/5">
              <div className="rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 space-y-1">
                <p className="text-xs text-muted-foreground">{item.date}</p>
                <div className="text-base font-semibold">
                  {item.title} at{" "}
                  <Link
                    href={item.url}
                    target="_blank"
                    className="hover:underline hover:underline-offset-2 hover:text-slate-700"
                  >
                    {item.company}
                  </Link>
                </div>
                <p className="text-sm font-light text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
      <div className="md:hidden space-y-5 my-10">
        {experiences.map((experience, idx) => (
          <div key={"experience" + idx} className="flex space-x-5 items-start">
            {experience.isTransparent ? (
              <div className="flex justify-center items-center rounded-full border h-10 w-10 overflow-hidden shadow-lg">
                <Image
                  src={experience.logo}
                  alt={experience.company}
                  width={48}
                  height={48}
                  className="w-full h-full max-w-6 max-h-6 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-10 w-10 overflow-hidden border rounded-full shadow-lg">
                <Image
                  src={experience.logo}
                  alt={experience.company}
                  width={48}
                  height={48}
                  className="w-full h-full rounded-full"
                />
              </div>
            )}
            <div className="space-y-1 flex-1">
              <p className="text-xs text-muted-foreground">{experience.date}</p>
              <div className="text-lg font-semibold">
                {experience.title} at{" "}
                <Link
                  href={experience.url}
                  target="_blank"
                  className="hover:underline hover:underline-offset-2 hover:text-slate-700"
                >
                  {experience.company}
                </Link>
              </div>
              <p className="text-sm font-light text-muted-foreground">
                {experience.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Projects section */}
      <h3 className="text-lg font-semibold mt-10 mb-5">Projects</h3>
      <div className="hidden md:flex items-center gap-3">
        {projects.map((item, id) => (
          <HoverCard key={id}>
            <Link href={item.url} target="_blank">
              <HoverCardTrigger asChild>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-card transition-colors hover:border-foreground/30">
                  <Image
                    src={item.logo}
                    alt={item.company}
                    width="80"
                    height="80"
                    className={cn(
                      "h-10 w-10 object-contain transition-transform duration-150 hover:scale-110",
                      item.isRounded && "rounded-lg",
                      // monochrome dark line-art logo (form-builder) — invert it
                      // in dark mode so it isn't lost on the dark tile.
                      typeof item.logo === "string" &&
                        item.logo.includes("form-builder") &&
                        "dark:invert"
                    )}
                  />
                </div>
              </HoverCardTrigger>
            </Link>
            <HoverCardContent className="w-72 p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl ring-1 ring-black/5">
              <div className="rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 space-y-1">
                <p className="text-xs text-muted-foreground">{item.date}</p>
                <div className="text-base font-semibold">
                  {item.title} at{" "}
                  <Link
                    href={item.url}
                    target="_blank"
                    className="hover:underline hover:underline-offset-2 hover:text-slate-700"
                  >
                    {item.company}
                  </Link>
                </div>
                <p className="text-sm font-light text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
      <div className="md:hidden space-y-5 my-10">
        {projects.map((experience, idx) => (
          <div key={"experience" + idx} className="flex space-x-5 items-start">
            {experience.isTransparent ? (
              <div className="flex justify-center items-center rounded-full border h-10 w-10 overflow-hidden shadow-lg">
                <Image
                  src={experience.logo}
                  alt={experience.company}
                  width={48}
                  height={48}
                  className="w-full h-full max-w-6 max-h-6 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-10 w-10 overflow-hidden border rounded-full shadow-lg">
                <Image
                  src={experience.logo}
                  alt={experience.company}
                  width={48}
                  height={48}
                  className="w-full h-full rounded-full"
                />
              </div>
            )}
            <div className="space-y-1 flex-1">
              <p className="text-xs text-muted-foreground">{experience.date}</p>
              <div className="text-lg font-semibold">
                {experience.title} at{" "}
                <Link
                  href={experience.url}
                  target="_blank"
                  className="hover:underline hover:underline-offset-2 hover:text-slate-700"
                >
                  {experience.company}
                </Link>
              </div>
              <p className="text-sm font-light text-muted-foreground">
                {experience.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
