"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyButton } from "@/components/copy-button";

interface PreviewTabsProps {
  preview: React.ReactNode;
  code: string;
  hint?: string;
  previewClassName?: string;
}

export function PreviewTabs({
  preview,
  code,
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
        <div className="relative overflow-hidden rounded-xl border bg-muted/30">
          <CopyButton
            value={code}
            className="absolute right-3 top-3 z-10 size-8 border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          />
          <ScrollArea className="h-[360px]">
            <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
              <code className="font-mono">{code}</code>
            </pre>
          </ScrollArea>
        </div>
      </TabsContent>
    </Tabs>
  );
}
