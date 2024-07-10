/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
    domains: [
      "a0.muscache.com",
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com",
      "lottie.host",
      "lottie",
      "https://u3v5o7m1.apicdn.sanity.io",
      "source.unsplash.com",
      "images.unsplash.com",
      "media.licdn.com",
      "i.pinimg.com",
      "instagram.fteq3-3.fna.fbcdn.net",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};
