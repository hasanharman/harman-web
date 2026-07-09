"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstallTabs } from "@/components/install-tabs";
import { CodeBlock } from "@/components/lab/code-block";

interface InstallationProps {
  /** The full shadcn exec command, e.g. "shadcn@latest add https://.../vinyl-record.json". */
  command: string;
  /** npm dependencies to install manually, e.g. ["motion", "next-themes"]. */
  dependencies: string[];
  /** shadcn UI components this depends on, e.g. ["card", "hover-card"]. */
  registryDependencies: string[];
  /** Component source. */
  code: string;
  /** Target path for the manual copy step. */
  filename?: string;
}

export function Installation({
  command,
  dependencies,
  registryDependencies,
  code,
  filename,
}: InstallationProps) {
  return (
    <Tabs defaultValue="command" className="gap-3">
      <TabsList className="h-auto bg-transparent p-0">
        <TabsTrigger
          value="command"
          className="rounded-md text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Command
        </TabsTrigger>
        <TabsTrigger
          value="manual"
          className="rounded-md text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Manual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="command" className="mt-0">
        <InstallTabs exec={command} />
      </TabsContent>

      <TabsContent value="manual" className="mt-0 space-y-6">
        {registryDependencies.length ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Add the required shadcn components:
            </p>
            <InstallTabs
              exec={`shadcn@latest add ${registryDependencies.join(" ")}`}
            />
          </div>
        ) : null}

        {dependencies.length ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Install the following dependencies:
            </p>
            <InstallTabs pkg={dependencies.join(" ")} />
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm font-medium">
            Copy and paste the following into your project.
          </p>
          <CodeBlock code={code} filename={filename} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
