import React from "react";
import { Metadata } from "next";
import Image from "next/image";

import Avatar from "@/assets/avatar.webp";
import SocialMediaButtons from "@/components/social-media-buttons";

export const metadata: Metadata = {
  title: "Hasan Harman - Connect",
  description:
    "I'm open to new opportunities and collaborations. Feel free to reach out to me.",
};

export default function Contact() {
  return (
    <div className="flex flex-col items-center space-y-3 py-6 text-center">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4">
        <Image
          src={Avatar}
          alt="Hasan Harman"
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <h2 className="text-2xl font-semibold">Let&apos;s Engage</h2>
      <p className="text-muted-foreground font-light">
        I&apos;m open to new opportunities and collaborations.
        <br />
        Feel free to reach out to me.
      </p>
      <SocialMediaButtons />
    </div>
  );
}
