"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/lab/code-block";

interface PreviewTabsProps {
  preview: React.ReactNode;
  code: string;
  filename?: string;
  hint?: string;
  previewClassName?: string;
}

export function PreviewTabs({
  preview,
  code,
  filename,
  hint,
  previewClassName,
}: PreviewTabsProps) {
  return (
    <Tabs defaultValue="preview" className="gap-2">
      <TabsList className="h-auto bg-transparent p-0">
        <TabsTrigger
          value="preview"
          className="rounded-md text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Preview
        </TabsTrigger>
        <TabsTrigger
          value="code"
          className="rounded-md text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Code
        </TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="mt-0">
        <div
          className={`relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border bg-card ${
            previewClassName ?? ""
          }`}
        >
          {hint ? (
            <span className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-2 py-0.5 text-xs font-light text-white">
              {hint}
            </span>
          ) : null}
          {preview}
        </div>
      </TabsContent>

      <TabsContent value="code" className="mt-0">
        <CodeBlock code={code} filename={filename} maxHeight="360px" />
      </TabsContent>
    </Tabs>
  );
}
