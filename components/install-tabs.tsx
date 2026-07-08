"use client";

import * as React from "react";
import { Terminal } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/copy-button";

const MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;
type Manager = (typeof MANAGERS)[number];

interface InstallTabsProps {
  /** Package(s) to install, e.g. "motion" or "clsx tailwind-merge". */
  pkg?: string;
  /** An executed command (npx-style), e.g. "shadcn@latest add form input". */
  exec?: string;
  /** Install as a dev dependency. */
  dev?: boolean;
}

function buildCommands({ pkg, exec, dev }: InstallTabsProps): Record<Manager, string> {
  if (exec) {
    return {
      npm: `npx ${exec}`,
      pnpm: `pnpm dlx ${exec}`,
      yarn: `yarn dlx ${exec}`,
      bun: `bunx ${exec}`,
    };
  }

  const target = pkg ?? "";
  const flag = dev
    ? { npm: "-D ", pnpm: "-D ", yarn: "-D ", bun: "-d " }
    : { npm: "", pnpm: "", yarn: "", bun: "" };

  return {
    npm: `npm install ${flag.npm}${target}`,
    pnpm: `pnpm add ${flag.pnpm}${target}`,
    yarn: `yarn add ${flag.yarn}${target}`,
    bun: `bun add ${flag.bun}${target}`,
  };
}

export function InstallTabs(props: InstallTabsProps) {
  const commands = buildCommands(props);
  const [active, setActive] = React.useState<Manager>(MANAGERS[0]);

  return (
    <div className="not-prose relative my-6 overflow-hidden rounded-lg border bg-muted/30">
      <Tabs
        value={active}
        onValueChange={(v) => setActive(v as Manager)}
        className="gap-0"
      >
        <div className="flex items-center gap-2 border-b px-3 py-1">
          <div className="flex size-4 items-center justify-center rounded-[1px] bg-foreground opacity-70">
            <Terminal className="size-3 text-background" />
          </div>
          <TabsList className="h-auto rounded-none bg-transparent p-0">
            {MANAGERS.map((m) => (
              <TabsTrigger
                key={m}
                value={m}
                className="h-7 rounded-md border border-transparent text-sm text-muted-foreground shadow-none data-[state=active]:border-input data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {m}
              </TabsTrigger>
            ))}
          </TabsList>
          <CopyButton
            value={commands[active]}
            className="ml-auto size-8 border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          />
        </div>

        {MANAGERS.map((m) => (
          <TabsContent key={m} value={m} className="mt-0 overflow-x-auto px-4 py-3.5">
            <pre className="font-mono text-sm leading-none">
              <code>
                <span className="select-none text-muted-foreground">$ </span>
                {commands[m]}
              </code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
