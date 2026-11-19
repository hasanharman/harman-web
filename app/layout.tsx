import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";

import { Questrial } from "next/font/google";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { PullCord } from "@/components/pull-cord";
import { ogImageUrl } from "@/config/site";

import "./globals.css";

const font = Questrial({
  weight: "400",
  display: "swap",
  subsets: ["latin-ext"],
  preload: true,
});

const defaultOg = ogImageUrl({
  title: "Curious engineer & frontend developer",
  label: "Portfolio",
  desc: "Animations, writings, and interactive UI experiments from Mersin.",
});

export const metadata: Metadata = {
  title: "Hasan Harman",
  description: "Curious engineer & Frontend developer from Mersin 🌴 🇹🇷",
  metadataBase: new URL("https://www.hasanharman.dev/"),
  openGraph: {
    title: "Hasan Harman",
    description: "Curious engineer & Frontend developer from Mersin.",
    type: "website",
    images: [{ url: defaultOg, width: 1200, height: 630, alt: "Hasan Harman" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [defaultOg],
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
      <Script
        src="https://umami.harmanstack.fyi/script.js"
        data-website-id="9a91619f-50c3-4e1f-b698-2e0cb049800e"
        data-domains="www.hasanharman.dev"
        strategy="afterInteractive"
      />
    </ViewTransitions>
  );
}
