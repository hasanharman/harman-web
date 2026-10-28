import React from "react";
import { existsSync } from "node:fs";
import path from "node:path";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";

import {
  LAB_ITEMS,
  getLabItem,
  installCommand,
  usageSnippet,
} from "@/config/lab";
import { ogImageUrl } from "@/config/site";
import { getRegistryItem } from "@/lib/registry";
import { highlightCode } from "@/lib/highlight";
import { ComponentPreview } from "@/components/lab/component-preview";
import { Installation } from "@/components/lab/installation";
import { CodeBlock } from "@/components/lab/code-block";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const INSTALLABLE = LAB_ITEMS.filter((item) => item.installable);

/** Strip a version specifier from a dependency string, keeping scopes intact. */
function depName(dep: string) {
  return dep.replace(/@[\^~\d][^@]*$/, "");
}

export function generateStaticParams() {
  return INSTALLABLE.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getLabItem(slug);
  if (!item) return {};
  const description = item.summary ?? item.description;
  // A captured still of the component (scripts/capture-og.mjs), when one exists.
  const stage = `/og/lab/${slug}.png`;
  const hasStage = existsSync(path.join(process.cwd(), "public", stage));
  const og = ogImageUrl({
    title: item.title,
    label: "Lab",
    desc: description,
    meta: `hasanharman.dev/lab/${slug}`,
    image: hasStage ? stage : undefined,
  });
  const image = { url: og, width: 1200, height: 630, alt: `${item.title} — ${description}` };
  return {
    title: `${item.title} - Lab`,
    description,
    alternates: { canonical: `/lab/${slug}` },
    openGraph: {
      title: item.title,
      description,
      type: "article",
      url: `/lab/${slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [image],
    },
  };
}

export default async function LabComponentPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getLabItem(slug);
  if (!item || !item.installable) notFound();

  const registryItem = getRegistryItem(slug);
  const code = registryItem?.files?.[0]?.content ?? "";
  const filename = registryItem?.files?.[0]?.path;
  const dependencies = (registryItem?.dependencies ?? []).map(depName);
  const registryDependencies = registryItem?.registryDependencies ?? [];

  const index = INSTALLABLE.findIndex((i) => i.slug === slug);
  const prev = index > 0 ? INSTALLABLE[index - 1] : null;
  const next =
    index < INSTALLABLE.length - 1 ? INSTALLABLE[index + 1] : null;

  // Highlight every snippet server-side (build time) so nothing ships to the client.
  const codeHtml = await highlightCode(code, "tsx");
  const usageHtml = await highlightCode(usageSnippet(item), "tsx");
  const examples = await Promise.all(
    (item.examples ?? []).map(async (example) => ({
      ...example,
      html: await highlightCode(example.code, "tsx"),
    }))
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/lab"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Lab
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
        <p className="text-lg font-light text-muted-foreground">
          {item.description}
        </p>
        {item.inspiration?.length ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>Inspired by</span>
            {item.inspiration.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-foreground underline-offset-2 hover:underline"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </p>
        ) : null}
        {item.writing ? (
          <Link
            href={item.writing}
            className="inline-flex items-center gap-1 text-sm hover:underline underline-offset-2"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Read the writeup
          </Link>
        ) : null}
      </div>

      <ComponentPreview
        preview={item.preview}
        code={code}
        html={codeHtml}
        hint={item.hint}
        previewClassName={item.previewClassName}
      />

      <section className="space-y-4">
        <h2
          id="installation"
          className="scroll-mt-20 text-2xl font-semibold tracking-tight"
        >
          Installation
        </h2>
        <Installation
          command={installCommand(slug)}
          dependencies={dependencies}
          registryDependencies={registryDependencies}
          code={code}
          codeHtml={codeHtml}
          filename={filename}
        />
      </section>

      <section className="space-y-4">
        <h2
          id="usage"
          className="scroll-mt-20 text-2xl font-semibold tracking-tight"
        >
          Usage
        </h2>
        <CodeBlock code={usageSnippet(item)} html={usageHtml} />
      </section>

      {examples.length ? (
        <section className="space-y-6">
          <h2
            id="examples"
            className="scroll-mt-20 text-2xl font-semibold tracking-tight"
          >
            Examples
          </h2>
          {examples.map((example) => (
            <div key={example.title} className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-medium tracking-tight">
                  {example.title}
                </h3>
                {example.description ? (
                  <p className="text-sm font-light text-muted-foreground">
                    {example.description}
                  </p>
                ) : null}
              </div>
              <ComponentPreview
                preview={example.preview}
                code={example.code}
                html={example.html}
                hint={example.hint}
                previewClassName={example.previewClassName}
              />
            </div>
          ))}
        </section>
      ) : null}

      {item.props?.length ? (
        <section className="space-y-4">
          <h2
            id="api-reference"
            className="scroll-mt-20 text-2xl font-semibold tracking-tight"
          >
            API Reference
          </h2>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2.5 font-medium">Prop</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Default</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {item.props.map((prop) => (
                  <tr key={prop.name} className="border-b last:border-0 align-top">
                    <td className="px-4 py-2.5">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {prop.name}
                      </code>
                    </td>
                    <td className="px-4 py-2.5">
                      <code className="font-mono text-xs text-muted-foreground">
                        {prop.type}
                      </code>
                    </td>
                    <td className="px-4 py-2.5">
                      <code className="font-mono text-xs text-muted-foreground">
                        {prop.default ?? "—"}
                      </code>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {prop.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <nav className="flex items-center justify-between border-t pt-6 text-sm">
        {prev ? (
          <Link
            href={`/lab/${prev.slug}`}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/lab/${next.slug}`}
            className="inline-flex items-center gap-1 text-right text-muted-foreground hover:text-foreground"
          >
            {next.title}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
