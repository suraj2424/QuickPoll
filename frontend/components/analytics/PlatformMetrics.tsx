"use client";

import { EngagementMetrics } from "@/lib/analytics-api";
import { FileText, ThumbsUp, Heart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentType } from "react";

interface PlatformMetricsProps {
  metrics: EngagementMetrics | null;
}

interface StatConfig {
  label: string;
  value: string;
  detail?: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}

export function PlatformMetrics({ metrics }: PlatformMetricsProps) {
  if (!metrics) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">
        No metrics available
      </p>
    );
  }

  const stats: StatConfig[] = [
    {
      label: "Polls",
      value: metrics.total_polls.toLocaleString(),
      detail: `${metrics.active_polls} active`,
      icon: FileText,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      label: "Votes",
      value: metrics.total_votes.toLocaleString(),
      detail: `${metrics.avg_votes_per_poll.toFixed(1)} avg`,
      icon: ThumbsUp,
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      label: "Likes",
      value: metrics.total_likes.toLocaleString(),
      icon: Heart,
      color: "text-rose-500 dark:text-rose-400",
    },
    {
      label: "Participation",
      value: `${metrics.participation_rate.toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-amber-500 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {stat.value}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {stat.label}
              {stat.detail && (
                <span className="text-zinc-400 dark:text-zinc-500"> · {stat.detail}</span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}