import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Package } from "lucide-react";

import { LAB_ITEMS, getLabItem, installCommand } from "@/config/lab";
import { getRegistryItem } from "@/lib/registry";
import { InstallTabs } from "@/components/install-tabs";
import { PreviewTabs } from "@/components/lab/preview-tabs";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return LAB_ITEMS.filter((item) => item.installable).map((item) => ({
    slug: item.slug,
  }));
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
  const dependencies = registryItem?.dependencies ?? [];
  const registryDependencies = registryItem?.registryDependencies ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/lab"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Lab
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{item.title}</h1>
          <Badge variant="secondary" className="gap-1">
            <Package className="h-3 w-3" />
            Installable
          </Badge>
        </div>
        <p className="text-muted-foreground font-light">{item.description}</p>
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
        hint={item.hint}
        previewClassName={item.previewClassName}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Installation</h2>
        <p className="text-sm font-light text-muted-foreground">
          Add this component to your project with the shadcn CLI.
        </p>
        <InstallTabs exec={installCommand(slug)} />
      </section>

      {dependencies.length || registryDependencies.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Dependencies</h2>
          <div className="flex flex-wrap gap-2">
            {registryDependencies.map((dep) => (
              <Badge key={dep} variant="outline">
                {dep}
              </Badge>
            ))}
            {dependencies.map((dep) => (
              <Badge key={dep} variant="secondary">
                {dep}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
