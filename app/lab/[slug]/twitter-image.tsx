import OpenGraphImage, { generateImageMetadata as openGraphMetadata } from "./opengraph-image";

// Next reads image exports statically, so re-declare rather than `export … from`.
export function generateImageMetadata(props: Parameters<typeof openGraphMetadata>[0]) {
  return openGraphMetadata(props);
}

export default function Image(props: Parameters<typeof OpenGraphImage>[0]) {
  return OpenGraphImage(props);
}
