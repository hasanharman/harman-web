import React from "react";

import { getStats, getPhotos } from "@/actions/unsplash";
import { ParallaxScroll } from "@/components/parallax-scroll";

export default async function Photos() {
  try {
    const stats = await getStats();
    const photos = await getPhotos();

    const views = stats?.views?.total;
    const downloads = stats?.downloads?.total;

    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">Photos</h1>
        <p className="text-muted-foreground font-light">
          Every photo we took has its own place in time.{" "}
          <span className="text-black italic">{views}</span> people looked at
          the moments when I stopped time, and{" "}
          <span className="text-black italic">{downloads}</span> people recorded
          these memories the same way I recorded them. Thank you to everyone who
          shared these moments with me.
        </p>
        <ParallaxScroll images={photos} />
      </div>
    );
  } catch (error: any) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
      </div>
    );
  }
}
