"use client";

import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export function PollSkeleton() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className={cn(
        "animate-pulse border p-6 shadow-elevation",
        isDark
          ? "border-neutral-700/60 bg-neutral-900/70"
          : "border-neutral-200 bg-white/90",
      )}
    >
      <div
        className={cn(
          "mb-4 h-4 w-1/2",
          isDark ? "bg-neutral-700/60" : "bg-neutral-200",
        )}
      />
      <div
        className={cn(
          "mb-2 h-3 w-3/4",
          isDark ? "bg-neutral-800/60" : "bg-neutral-100",
        )}
      />
      <div
        className={cn(
          "mb-6 h-3 w-1/3",
          isDark ? "bg-neutral-800/60" : "bg-neutral-100",
        )}
      />

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-12 border",
              isDark
                ? "border-neutral-700/60 bg-neutral-900/60"
                : "border-neutral-200 bg-neutral-100",
            )}
          />
        ))}
      </div>
    </div>
  );
}
