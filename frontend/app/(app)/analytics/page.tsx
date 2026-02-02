"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlatformMetrics } from "@/components/analytics/PlatformMetrics";
import { TrendCharts } from "@/components/analytics/TrendCharts";
import { TopPerformers } from "@/components/analytics/TopPerformers";
import {
  fetchAnalyticsDashboard,
  fetchVoteTrends,
  fetchEngagementMetrics,
  fetchTopPolls,
  AnalyticsDashboardResponse,
  VoteTrendItem,
  EngagementMetrics,
  TopPollsResponse,
} from "@/lib/analytics-api";

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const initialRange = (searchParams.get("range") as TimeRange) || "30d";

  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardResponse | null>(null);
  const [voteTrends, setVoteTrends] = useState<VoteTrendItem[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [topPolls, setTopPolls] = useState<TopPollsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const days = timeRange === "all" ? 365 : timeRange === "90d" ? 90 : timeRange === "30d" ? 30 : 7;

        const [dashboard, trends, metrics, topPollsData] = await Promise.all([
          fetchAnalyticsDashboard(),
          fetchVoteTrends(days),
          fetchEngagementMetrics(),
          fetchTopPolls(),
        ]);

        setDashboardData(dashboard);
        setVoteTrends(trends.trends);
        setEngagementMetrics(metrics);
        setTopPolls(topPollsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Analytics</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Loading...</p>
        </header>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Analytics</h1>
        </header>
        <div className="p-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Analytics</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Platform performance overview
        </p>
      </header>

      {/* Metrics */}
      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Overview</h2>
        <PlatformMetrics metrics={engagementMetrics} />
      </section>

      {/* Trends */}
      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Trends</h2>
        <TrendCharts
          data={voteTrends}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </section>

      {/* Top Polls */}
      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Top polls</h2>
        <TopPerformers polls={topPolls?.polls || []} />
      </section>
    </div>
  );
}