"use client";

import { cn } from "@/lib/utils";

interface InsightPillProps {
  label: string;
  value: string | number;
  accent: string;
  truncate?: boolean;
}

export function InsightPill({ label, value, accent, truncate = false }: InsightPillProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/60">
      <div className="space-y-1">
        <p className="text-[0.7rem] font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</p>
        <span
          className={cn(
            "text-xl font-bold text-zinc-800 dark:text-zinc-100",
            truncate && "block truncate max-w-48",
          )}
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </span>
      </div>
      <span className={cn("h-10 w-10 rounded-full bg-linear-to-r", accent)} />
    </div>
  );
}
