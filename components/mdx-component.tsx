import Image from "next/image";
import * as runtime from "react/jsx-runtime";

import { Callout } from "@/components/callout";
import VinylRecord from "@/components/vinyl-record";
import { GitHubCard } from "@/components/github-card";
import { Pre } from "@/components/pre";
import { InstallTabs } from "@/components/install-tabs";

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

const components = {
  Image,
  Callout,
  VinylRecord,
  GitHubCard,
  InstallTabs,
  pre: Pre,
};

interface MdxProps {
  code: string;
}

export function MDXContent({ code }: MdxProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}
