import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";

import { Questrial } from "next/font/google";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { PullCord } from "@/components/pull-cord";

import "./globals.css";

const font = Questrial({
  weight: "400",
  display: "swap",
  subsets: ["latin-ext"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Hasan Harman",
  description: "Curious engineer & Frontend developer from Mersin 🌴 🇹🇷",
  metadataBase: new URL("https://www.hasanharman.dev/"),
  openGraph: {
    images: "https://www.hasanharman.dev/meta.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className="max-w-3xl mx-auto space-y-6 my-5 px-2 md:px-0">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader color="#2F7B70" />
            <PullCord />
            <Header fontClass={font.className} />
            <main className={font.className}>{children}</main>
          </ThemeProvider>
        </body>
      </html>
      <Analytics />
      <SpeedInsights />
    </ViewTransitions>
  );
}
