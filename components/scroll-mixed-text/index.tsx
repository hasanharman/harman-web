"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollMixedText() {
  const { scrollYProgress } = useScroll();

  const rotate1 = useTransform(scrollYProgress, [0, 1], [16.1589, 0]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [-12.9271, 0]);
  const rotate3 = useTransform(scrollYProgress, [0, 1], [12.9271, 0]);
  const rotate4 = useTransform(scrollYProgress, [0, 1], [-16.1589, 0]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen overflow-hidden sticky top-0 text-gray-800 text-base leading-6 box-border">
      <motion.div
        className="font-sans text-base leading-normal box-border flex flex-col justify-center items-center w-screen h-screen mt-[-50svh] ml-[-50svw] absolute top-1/2 left-1/2 transform-none"
        style={{ rotate: rotate1 }}
      >
        <motion.div
          className="font-sans text-base box-border transition-all duration-200 absolute left-1/2 leading-none text-center w-[440px] ml-[-220px] will-change-transform custom-transform custom-transform-style"
          style={{ rotate: rotate1 }}
        >
          <div className="mh">Aim high.</div>
          <div className="mh">Build fast.</div>
        </motion.div>
      </motion.div>

      <motion.div className="target-circle" style={{ rotate: rotate2 }}>
        <div className="font-sans text-base leading-normal box-border flex flex-col justify-center items-center w-screen h-screen mt-[-50svh] ml-[-50svw] absolute top-1/2 left-1/2 transform-none">
          <motion.div
            className="font-sans text-base box-border transition-all duration-200 absolute left-1/2 leading-none text-center w-[440px] ml-[-220px] will-change-transform custom-transform custom-transform-style"
            style={{ rotate: rotate2 }}
          >
            <div className="box-border font-bold tracking-[-.02em] mt-0 text-[138px] leading-[.8em] text-center mb-[20px]">
              Aim high.
            </div>
            <div className="box-border font-bold tracking-[-.02em] mt-0 text-[138px] leading-[.8em] text-center mb-[20px]">
              Build fast.
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div className="target-circle md" style={{ rotate: rotate3 }}>
        <div className="font-sans text-base leading-normal box-border flex flex-col justify-center items-center w-screen h-screen mt-[-50svh] ml-[-50svw] absolute top-1/2 left-1/2 transform-none">
          <motion.div
            className="font-sans text-base box-border transition-all duration-200 absolute left-1/2 leading-none text-center w-[440px] ml-[-220px] will-change-transform custom-transform custom-transform-style"
            style={{ rotate: rotate3 }}
          >
            <div className="box-border font-bold tracking-[-.02em] mt-0 text-[138px] leading-[.8em] text-center mb-[20px]">
              Aim high.
            </div>
            <div className="box-border font-bold tracking-[-.02em] mt-0 text-[138px] leading-[.8em] text-center mb-[20px]">
              Build fast.
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div className="target-circle sm" style={{ rotate: rotate4 }}>
        <div className="font-sans text-base leading-normal box-border flex flex-col justify-center items-center w-screen h-screen mt-[-50svh] ml-[-50svw] absolute top-1/2 left-1/2 transform-none">
          <motion.div
            className="font-sans text-base box-border transition-all duration-200 absolute left-1/2 leading-none text-center w-[440px] ml-[-220px] will-change-transform custom-transform custom-transform-style"
            style={{ rotate: rotate4 }}
          >
            <div className="box-border font-bold tracking-[-.02em] mt-0 text-[138px] leading-[.8em] text-center mb-[20px]">
              Aim high.
            </div>
            <div className="box-border font-bold tracking-[-.02em] mt-0 text-[138px] leading-[.8em] text-center mb-[20px]">
              Build fast.
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="target-circle xs"></div>
    </div>
  );
}
