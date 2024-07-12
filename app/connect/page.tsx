import React from "react";
import { Metadata } from "next";
import Image from "next/image";

import Avatar from "@/assets/avatar.jpeg";
import SocialMediaButtons from "@/components/social-media-buttons";

export const metadata: Metadata = {
  title: "Hasan Harman - Connect",
  description:
    "I'm always open to new opportunities and collaborations. Feel free to reach out to me.",
};

export default function Contact() {
  return (
    <div className="flex flex-col items-center space-y-3 py-6 text-center">
      <Image
        src={Avatar}
        alt="Hasan Harman"
        width="150"
        height="150"
        className="w-28 h-28 rounded-full border-4"
      />
      <h2 className="text-2xl font-semibold">Let's Engage</h2>
      <p className="text-muted-foreground font-light">
        I'm always open to new opportunities and collaborations.
        <br />
        Feel free to reach out to me.
      </p>
      <SocialMediaButtons />
    </div>
  );
}
