export const siteConfig = {
  name: "Hasan Harman",
  url: "https://hasanharman.dev",
  description: "Nextjs 14 blog using velite, tailwind and shadcn",
  author: "Hasan Harman",
  avatar:
    "https://media.licdn.com/dms/image/D4D03AQHUIEdxFKscwg/profile-displayphoto-shrink_400_400/0/1674498435441?e=1726704000&v=beta&t=ByKY0dzzmhXycy1_v6AhFgshJtPbaAmrkNEccNQix7Y",
  links: {
    twitter: "https://twitter.com/strad3r",
    github: "https://github.com/hasanharman",
    personalSite: "https://hasanharman.dev",
  },
};

export type SiteConfig = typeof siteConfig;

/** Build the dynamic OG image URL for a page. */
export function ogImageUrl(params: {
  title: string;
  label?: string;
  desc?: string;
  meta?: string;
}) {
  const search = new URLSearchParams({ title: params.title });
  if (params.label) search.set("label", params.label);
  if (params.desc) search.set("desc", params.desc);
  if (params.meta) search.set("meta", params.meta);
  return `/api/og?${search.toString()}`;
}
