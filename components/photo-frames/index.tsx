"use client";

import Image, { StaticImageData } from "next/image";
import { motion } from "motion/react";

const DEFAULT_IMAGES: (string | StaticImageData)[] = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=800&auto=format&fit=crop",
];

const ROTATIONS = [-7, 4, -3, 8];

interface PhotoFramesProps {
  images?: (string | StaticImageData)[];
}

export default function PhotoFrames({
  images = DEFAULT_IMAGES,
}: PhotoFramesProps) {
  return (
    <div className="flex justify-center items-center">
      {images.map((image, idx) => (
        <motion.div
          key={"frame" + idx}
          style={{
            rotate: ROTATIONS[idx % ROTATIONS.length],
          }}
          whileHover={{
            scale: 1.1,
            rotate: 0,
            zIndex: 100,
          }}
          whileTap={{
            scale: 1.1,
            rotate: 0,
            zIndex: 100,
          }}
          className="rounded-xl -mr-4 mt-4 p-1.5 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-200 shadow-lg ring-1 ring-black/5 flex-shrink-0 overflow-hidden"
        >
          <Image
            src={image}
            alt="personal images"
            width="500"
            height="500"
            className="rounded-lg h-20 w-20 md:h-40 md:w-56 object-cover flex-shrink-0"
          />
        </motion.div>
      ))}
    </div>
  );
}
