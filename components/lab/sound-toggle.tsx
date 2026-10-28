"use client";

import { cloneElement, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Wraps a sound demo with a mute button that switches off the child's `*Sound` props. */
export function SoundToggle({ children }: { children: React.ReactElement<Record<string, unknown>> }) {
  const [muted, setMuted] = useState(false);
  const silenced = Object.fromEntries(
    Object.keys(children.props)
      .filter((key) => key.endsWith("Sound"))
      .map((key) => [key, false])
  );

  return (
    <>
      {muted ? cloneElement(children, silenced) : children}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        aria-pressed={muted}
        className="absolute left-3 top-3 z-20 inline-flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/85"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </>
  );
}
