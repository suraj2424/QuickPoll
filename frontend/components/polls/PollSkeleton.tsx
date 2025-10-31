"use client";

import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export function PollSkeleton() {
  const { theme } = useTheme();
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border p-6 shadow-lg shadow-indigo-500/10 backdrop-blur",
        theme === "dark"
          ? "border-zinc-700/60 bg-zinc-900/70"
          : "border-zinc-200 bg-white/90",
      )}
    >
      <div
        className={cn(
          "mb-4 h-4 w-1/2 rounded",
          theme === "dark" ? "bg-zinc-700/60" : "bg-zinc-200",
        )}
      />
      <div
        className={cn(
          "mb-2 h-3 w-3/4 rounded",
          theme === "dark" ? "bg-zinc-800/60" : "bg-zinc-100",
        )}
      />
      <div
        className={cn(
          "mb-6 h-3 w-1/3 rounded",
          theme === "dark" ? "bg-zinc-800/60" : "bg-zinc-100",
        )}
      />

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-12 rounded-xl border",
              theme === "dark"
                ? "border-zinc-700/60 bg-zinc-900/60"
                : "border-zinc-200 bg-zinc-100",
            )}
          />
        ))}
      </div>
    </div>
  );
}
