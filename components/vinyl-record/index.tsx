"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const DiscVariants = {
  hidden: {
    top: "-10%",
    x: "-50%",
    opacity: 0.9,
  },
  visible: {
    top: "-50%",
    x: "-50%",
    opacity: 1,
  },
};

const CoverVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

export default function VinylRecord() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-end justify-center min-h-[500px] bg-gray-100 rounded p-4">
      <div className="relative w-64 h-64">
        <AnimatePresence>
          {/* Vinyl Disc */}
          <motion.div
            className="absolute left-1/2 rounded-full z-0 w-60 h-60"
            variants={DiscVariants}
            initial="hidden"
            animate={isHovered ? "visible" : "hidden"}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              background:
                "radial-gradient(circle at center, #0a0a0a 0%, #000000 80%)",
              boxShadow: "inset 0 0 10px rgba(255, 255, 255, 0.5)",
            }}
          >
            {/* Grooves Pattern */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full"
              style={{
                background:
                  "repeating-radial-gradient(circle at center, #333 0, #333 1px, transparent 1px, transparent 4px)",
              }}
            />
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 bg-gray-400 rounded-full flex items-center justify-center">
              <motion.div
                className="w-1/3 h-1/3 bg-white rounded-full"
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{
                  duration: 3,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Record Cover */}
        <motion.div
          className="relative w-full h-full rounded shadow-xl z-10 overflow-hidden"
          variants={CoverVariants}
          initial="initial"
          whileHover="hover"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src="https://linkinpedia.com/w/images/thumb/f/fe/Album-From_Zero.png/800px-Album-From_Zero.png"
            alt="Album Cover"
            fill
            sizes="(max-width: 256px) 100vw, 256px"
            className="object-cover"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}
