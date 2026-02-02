"use client";

import { PlatformStats } from "@/lib/admin-api";
import { Users, BarChart3, Vote, Activity } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AdminStatsProps {
  stats: PlatformStats | null;
  isLoading: boolean;
}

export function AdminStats({ stats, isLoading }: AdminStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  p-6 animate-pulse"
          >
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-4"></div>
            <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  p-6 text-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          No statistics available
        </p>
      </div>
    );
  }

  const statsConfig = [
    {
      label: "Total Users",
      value: stats.total_users.toLocaleString(),
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      growth: stats.user_growth_percentage,
    },
    {
      label: "Active Polls",
      value: stats.active_polls.toLocaleString(),
      icon: BarChart3,
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Votes Today",
      value: stats.total_votes_today.toLocaleString(),
      icon: Vote,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "System Health",
      value: stats.system_health.charAt(0).toUpperCase() + stats.system_health.slice(1),
      icon: Activity,
      iconColor:
        stats.system_health === "healthy"
          ? "text-green-600 dark:text-green-400"
          : stats.system_health === "degraded"
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-red-600 dark:text-red-400",
      iconBg:
        stats.system_health === "healthy"
          ? "bg-green-100 dark:bg-green-900/30"
          : stats.system_health === "degraded"
          ? "bg-yellow-100 dark:bg-yellow-900/30"
          : "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  p-6 hover:shadow-elevation transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2  ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            {stat.growth !== undefined && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.growth > 0
                    ? "text-green-600 dark:text-green-400"
                    : stat.growth < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-neutral-500"
                }`}
              >
                {stat.growth > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : stat.growth < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                {Math.abs(stat.growth)}%
              </div>
            )}
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
