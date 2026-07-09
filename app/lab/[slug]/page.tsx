import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

import {
  LAB_ITEMS,
  getLabItem,
  installCommand,
  usageSnippet,
} from "@/config/lab";
import { getRegistryItem } from "@/lib/registry";
import { PreviewTabs } from "@/components/lab/preview-tabs";
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
  return {
    title: `${item.title} - Lab`,
    description: item.description,
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

      <PreviewTabs
        preview={item.preview}
        code={code}
        filename={filename}
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
        <CodeBlock code={usageSnippet(item)} />
      </section>

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
