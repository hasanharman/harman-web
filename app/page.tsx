"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

import Avatar from "@/assets/avatar.jpeg";
import SightImage from "@/assets/sight.jpg";
import HomeImage from "@/assets/home.jpg";
import HabitImage from "@/assets/habit.jpg";

export default function Home() {
  const images = [SightImage, HabitImage, HomeImage];

  const experiences = [
    {
      title: "Frontend Developer & Director",
      company: "Hostbot Inc.",
      date: "2023 - Today",
      description:
        "Hostbot is the first property management software in Turkey. I'm responsible for the technical frontend architecture and development of the project. We developed this system with Nextjs Tailwindcss and server actions.",
      logo: "https://media.licdn.com/dms/image/D4D0BAQG1TOBGAoYHig/company-logo_200_200/0/1705317220125/hostbotapp_logo?e=1728518400&v=beta&t=1A-KfmqSUdYuzTNyYDQQvIpA1OHY1pz_zJ-qSJaTvMI",
      url: "https://www.hostbot.app/",
      isLogoTransparent: true,
    },
    {
      title: "Frontend Developer",
      company: "Clup.com",
      date: "2023 - 2024",
      description:
        "I was responsible for writing reusable components with Nextjs and establishing the frontend structure of the project. I personally developed the user profile, messaging and payment steps using Stripe.",
      logo: "https://media.licdn.com/dms/image/D4D0BAQHn2wIcg0cBhw/company-logo_200_200/0/1706217207241/clup_com_logo?e=1728518400&v=beta&t=myNMQWzHJ-I7dLx2oiPa-rdOO_JcpTcVRK1cvQcFCZM",
      url: "https://www.hostbot.app/",
      isLogoTransparent: false,
    },
    {
      title: "Full Stack Developer",
      company: "Closar",
      date: "2022 - 2023",
      description: "Building frontend applications with React",
      logo: "https://i.pinimg.com/originals/8e/03/cc/8e03cca348047dee0314bdc04c3079ad.png",
      url: "https://www.hostbot.app/",
      isLogoTransparent: false,
    },
    {
      title: "Frontend Developer",
      company: "Pacemaker Inc.",
      date: "2021 - 2022",
      description:
        "Pacemaker is a multidisciplinary digital agency. I initially joined Pacemaker as a frontend developer and successfully progressed to the role of a full-stack developer over the years. During my tenure at Pacemaker, I contributed to nearly 20 projects within a span of 2 years. In my final 6 months, I assumed the additional responsibility of managing the development team.",
      logo: "https://media.licdn.com/dms/image/C4D0BAQGC8erqhDgRVw/company-logo_200_200/0/1630501102453/pacemakersw_logo?e=1728518400&v=beta&t=tI7udKe4DTVguS8Nc6nOgUKMrv_nFhlfHWU_M-NEhH0",
      url: "https://www.hostbot.app/",
      isLogoTransparent: false,
    },
    {
      title: "Software Developer (Intern)",
      company: "Vestel",
      date: "2020 - 2021",
      description:
        "My involvement in developing a portable game console for Vestel phones led to a job offer directly from Vestel. Initially, I primarily focused on smart home applications, where I specialized in crafting user interfaces using Swift. Subsequently, following a departmental transition, I took on the task of coding a dial test simulator for electric cars.",
      logo: "https://statics.vestel.com.tr/contents/images/archive/vestel-kirmizi-logo-buyuk1(1).png",
      url: "https://www.hostbot.app/",
      isLogoTransparent: true,
    },
  ];

  return (
    <section>
      {/* Introduction section */}
      <div className="flex flex-col justify-center items-center text-center space-y-2">
        <Image
          src={Avatar}
          alt="Hasan Harman"
          width="64"
          height="64"
          className="w-16 h-16 rounded-full border-4"
        />
        <h2 className="text-2xl font-semibold">Hasan Harman</h2>
        <p className="text-muted-foreground ">
          Curious engineer & Frontend developer from Istanbul 🇹🇷
        </p>
        <div className="flex justify-center items-center">
          {images.map((image, idx) => (
            <motion.div
              key={"images" + idx}
              style={{
                rotate: Math.random() * 20 - 10,
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
              className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 flex-shrink-0 overflow-hidden"
            >
              <Image
                src={image}
                alt="bali images"
                width="500"
                height="500"
                className="rounded-lg h-20 w-20 md:h-40 md:w-56 object-cover flex-shrink-0"
              />
            </motion.div>
          ))}
        </div>
      </div>
      {/* Experience section */}
      <div className="space-y-5 my-10">
        <h3 className="text-lg font-semibold">Experiences</h3>
        {experiences.map((experience, idx) => (
          <div key={"experience" + idx} className="flex space-x-5 items-start">
            {experience.isLogoTransparent ? (
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
