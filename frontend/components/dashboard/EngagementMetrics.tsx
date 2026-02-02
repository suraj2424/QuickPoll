"use client";

import { TrendingUp, TrendingDown, Users, Clock, Star, Share2 } from "lucide-react";
import type { Poll } from "@/lib/types";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor?: string;
}

function MetricCard({ title, value, change, changeLabel, icon, iconColor = "bg-primary-100 text-primary-600" }: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-elevation hover:shadow-elevation-2 transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive && <TrendingUp className="h-4 w-4 text-success-500" />}
              {isNegative && <TrendingDown className="h-4 w-4 text-error-500" />}
              <span className={`text-sm font-medium ${isPositive ? "text-success-600" : isNegative ? "text-error-600" : "text-neutral-500"}`}>
                {isPositive ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center  ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface EngagementMetricsProps {
  polls: Poll[];
}

export function EngagementMetrics({ polls }: EngagementMetricsProps) {
  // Calculate real metrics from polls data
  const metrics = (() => {
    if (polls.length === 0) {
      return {
        avgOptionsPerPoll: 0,
        totalVotes: 0,
        avgVotesPerPoll: 0,
        activePolls: 0,
      };
    }

    const totalOptions = polls.reduce((sum, poll) => sum + poll.options.length, 0);
    const totalVotes = polls.reduce((sum, poll) => sum + poll.total_votes, 0);
    const activePolls = polls.filter((poll) => poll.is_active).length;

    return {
      avgOptionsPerPoll: (totalOptions / polls.length).toFixed(1),
      totalVotes,
      avgVotesPerPoll: Math.round(totalVotes / polls.length),
      activePolls,
    };
  })();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Avg Options/Poll"
        value={metrics.avgOptionsPerPoll}
        icon={<List className="h-6 w-6" />}
        iconColor="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
      />
      <MetricCard
        title="Total Votes"
        value={metrics.totalVotes.toLocaleString()}
        icon={<Users className="h-6 w-6" />}
        iconColor="bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400"
      />
      <MetricCard
        title="Avg Votes/Poll"
        value={metrics.avgVotesPerPoll.toLocaleString()}
        icon={<Star className="h-6 w-6" />}
        iconColor="bg-warning-100 dark:bg-warning-900/50 text-warning-600 dark:text-warning-400"
      />
      <MetricCard
        title="Active Polls"
        value={metrics.activePolls}
        icon={<Share2 className="h-6 w-6" />}
        iconColor="bg-success-100 dark:bg-success-900/50 text-success-600 dark:text-success-400"
      />
    </div>
  );
}

// Simple List icon component
function List({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}
