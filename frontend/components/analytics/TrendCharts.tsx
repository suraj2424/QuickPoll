"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { VoteTrendItem } from "@/lib/analytics-api";
import { cn } from "@/lib/utils";

interface TrendChartsProps {
  data: VoteTrendItem[];
  timeRange: "7d" | "30d" | "90d" | "all";
  onTimeRangeChange: (range: "7d" | "30d" | "90d" | "all") => void;
}

const TIME_OPTIONS = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "all", label: "All" },
] as const;

export function TrendCharts({ data, timeRange, onTimeRangeChange }: TrendChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#3f3f46" : "#e4e4e7"; // zinc-700 / zinc-200
  const textColor = isDark ? "#a1a1aa" : "#71717a"; // zinc-400 / zinc-500

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const showMonth = timeRange === "90d" || timeRange === "all";
    return date.toLocaleDateString("en-US", {
      month: showMonth ? "short" : undefined,
      day: "numeric",
    });
  };

  const comparison = useMemo(() => {
    if (data.length < 2) return null;

    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid).reduce((sum, d) => sum + d.votes, 0);
    const secondHalf = data.slice(mid).reduce((sum, d) => sum + d.votes, 0);

    if (firstHalf === 0) return null;

    const change = ((secondHalf - firstHalf) / firstHalf) * 100;
    return {
      value: Math.abs(change).toFixed(0),
      isUp: change >= 0,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">
        No trend data available
      </p>
    );
  }

  const tooltipStyle = {
    backgroundColor: isDark ? "#18181b" : "#fff",
    border: `1px solid ${isDark ? "#3f3f46" : "#e4e4e7"}`,
    borderRadius: "0",
    fontSize: "12px",
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Vote Activity
          </h3>
          {comparison && (
            <p
              className={cn(
                "text-xs mt-0.5",
                comparison.isUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {comparison.isUp ? "+" : "-"}{comparison.value}% vs previous period
            </p>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange(option.value)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                timeRange === option.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="p-4 space-y-6">
        {/* Votes Chart */}
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Votes over time</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="voteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: textColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: textColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="votes"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  fill="url(#voteGradient)"
                  name="Votes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Polls Chart */}
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Polls created</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: textColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: textColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="polls"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                  name="Polls"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}