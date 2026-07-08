"use client";

import Image, { StaticImageData } from "next/image";
import { motion } from "motion/react";

import SightImage from "@/assets/sight.webp";
import HabitImage from "@/assets/habit.webp";
import HomeImage from "@/assets/home.webp";
import AstroImage from "@/assets/astro.webp";

const DEFAULT_IMAGES: StaticImageData[] = [
  SightImage,
  HabitImage,
  HomeImage,
  AstroImage,
];

const ROTATIONS = [-7, 4, -3, 8];

interface PhotoFramesProps {
  images?: StaticImageData[];
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
