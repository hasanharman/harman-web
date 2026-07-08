import { FaGithub } from "react-icons/fa6";
import { Star, GitFork } from "lucide-react";

interface GitHubCardProps {
  repo: string;
  title?: string;
  description?: string;
}

export function GitHubCard({ repo, title, description }: GitHubCardProps) {
  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose group my-8 flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5 no-underline transition-colors hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
    >
      <FaGithub className="h-9 w-9 shrink-0 text-neutral-800 dark:text-neutral-100" />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {title ?? repo}
          </span>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Open source
          </span>
        </div>
        {description ? (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
        <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-500">
          <span>{repo}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" /> Star
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" /> Fork
          </span>
        </div>
      </div>
      <span className="shrink-0 self-center text-sm font-medium text-neutral-400 transition-transform group-hover:translate-x-0.5 dark:text-neutral-500">
        View →
      </span>
    </a>
  );
}
