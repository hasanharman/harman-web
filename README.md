# Hasan Harman - Personal Website

Personal website and writing platform built with Next.js, Tailwind CSS, shadcn/ui, and Velite.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- Velite (content layer)
- MDX

## Local Development

Requirements:

- Node.js 20.9+
- pnpm

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

- `pnpm dev` - run dev server
- `pnpm build` - build content with Velite, then run production build
- `pnpm start` - start production server
- `pnpm lint` - run ESLint

## Content

- Writings are under `content/writings/*.mdx`
- Routes are in `app/*`
- Shared UI components are in `components/*`

## Build Notes

- Sitemap generation runs automatically after build via `next-sitemap`.
- The OG image API route is configured in `app/api/og/route.tsx`.
