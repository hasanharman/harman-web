import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  FaXTwitter,
  FaInstagram,
  FaGithub,
  FaUnsplash,
  FaRegEnvelope,
} from "react-icons/fa6";

export default function SocialMediaButtons() {
  return (
    <div className="space-x-2">
      <Link href="https://x.com/strad3r" target="_blank" aria-label="Twitter">
        <Button size="icon" variant="outline">
          <FaXTwitter className="text-muted-foreground" />
        </Button>
      </Link>
      <Link
        href="https://www.instagram.com/haskup/"
        target="_blank"
        aria-label="Instagram"
      >
        <Button size="icon" variant="outline">
          <FaInstagram className="text-muted-foreground" />
        </Button>
      </Link>
      <Link
        href="https://github.com/hasanharman"
        target="_blank"
        aria-label="Github"
      >
        <Button size="icon" variant="outline">
          <FaGithub className="text-muted-foreground" />
        </Button>
      </Link>
      <Link
        href="https://unsplash.com/@haskup"
        target="_blank"
        aria-label="Unsplash"
      >
        <Button size="icon" variant="outline">
          <FaUnsplash className="text-muted-foreground" />
        </Button>
      </Link>
      <Link
        href="mailto:hasanharman33@gmail.com"
        target="_blank"
        aria-label="E-mail"
      >
        <Button size="icon" variant="outline">
          <FaRegEnvelope className="text-muted-foreground" />
        </Button>
      </Link>
    </div>
  );
}
