import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";

import { Questrial } from "next/font/google";

import Header from "@/components/header";

import "./globals.css";

const font = Questrial({
  weight: "400",
  display: "swap",
  subsets: ["latin-ext"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Hasan Harman",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className="max-w-3xl mx-auto space-y-6 my-5 px-5 md:px-0">
          <NextTopLoader color="#2F7B70" />
          <Header fontClass={font.className} />
          <main className={font.className}>{children}</main>
        </body>
      </html>
      <Analytics />
      <SpeedInsights />
    </ViewTransitions>
  );
}
