"use client";

import { PollEngagementItem } from "@/lib/analytics-api";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopPerformersProps {
  polls: PollEngagementItem[];
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function TopPerformers({ polls }: TopPerformersProps) {
  if (polls.length === 0) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">
        No poll data available
      </p>
    );
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
      {polls.map((poll, index) => {
        const isTop3 = index < 3;

        return (
          <div
            key={poll.poll_id}
            className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900"
          >
            {/* Rank */}
            <span
              className={cn(
                "w-6 text-center text-sm font-semibold tabular-nums",
                index === 0 && "text-amber-500",
                index === 1 && "text-zinc-400",
                index === 2 && "text-orange-400",
                index > 2 && "text-zinc-300 dark:text-zinc-600"
              )}
            >
              {index + 1}
            </span>

            {/* Poll Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {poll.title || "Untitled Poll"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDate(poll.created_at)} · {poll.votes} votes · {poll.likes} likes
              </p>
            </div>

            {/* Engagement Rate */}
            <div className="flex items-center gap-1.5 shrink-0">
              <TrendingUp
                className={cn(
                  "h-3.5 w-3.5",
                  poll.engagement_rate > 50
                    ? "text-emerald-500"
                    : poll.engagement_rate > 30
                      ? "text-amber-500"
                      : "text-zinc-400"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  poll.engagement_rate > 50
                    ? "text-emerald-600 dark:text-emerald-400"
                    : poll.engagement_rate > 30
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {poll.engagement_rate.toFixed(0)}%
              </span>
            </div>

            {/* Top 3 Badge */}
            {isTop3 && (
              <span className="hidden sm:block text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Top
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
