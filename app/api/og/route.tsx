import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";

const interBold = fetch(
  new URL("../../../assets/fonts/Inter-Bold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
  try {
    const fontBold = await interBold;

    const { searchParams } = req.nextUrl;
    const title = searchParams.get("title");

    if (!title) {
      return new Response("No title provided", { status: 500 });
    }

    const heading =
      title.length > 140 ? `${title.substring(0, 140)}...` : title;

    return new ImageResponse(
      (
        <div tw="w-full h-full relative flex items-center justify-center bg-slate-200">
          <div tw="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div tw="flex relative flex-col p-12 w-full h-full items-start text-black bg-white">
            <div tw="flex items-center">
              <img
                src={siteConfig.avatar}
                alt="Hasan Harman"
                width="48"
                height="48"
                tw="rounded-full border"
              />
              <p tw="ml-2 font-bold text-2xl">Hasan Harman</p>
            </div>
            <div tw="flex flex-col flex-1 py-10">
              <div tw="flex text-xl uppercase font-bold tracking-tight font-normal">
                Writings
              </div>
              <div tw="flex text-[80px] font-bold text-[50px]">{heading}</div>
            </div>
            <div tw="flex items-center w-full justify-between">
              <div tw="flex text-xl">{siteConfig.url}</div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontBold,
            style: "normal",
            weight: 700,
          },
        ],
      }
    );
  } catch (error) {
    return new Response("Failed to generate image", { status: 500 });
  }
}
