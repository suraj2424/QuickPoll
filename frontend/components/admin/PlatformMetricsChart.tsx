"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { Calendar } from "lucide-react";

interface MetricsData {
  date: string;
  users: number;
  polls: number;
  engagement: number;
}

export function PlatformMetricsChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Deterministic pseudo-random based on index for consistent data
  const pseudoRandom = (index: number, seed: number) => {
    const x = Math.sin(index * 12.9898 + seed) * 43758.5453;
    return x - Math.floor(x);
  };

  // Generate mock data based on time range
  const data = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const metricsData: MetricsData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic-looking data with some variation
      const baseUsers = 100 + (days - i) * 2;
      const userVariation = Math.floor(pseudoRandom(i, 1) * 10) - 5;
      const basePolls = 5 + Math.floor((days - i) * 0.3);
      const pollVariation = Math.floor(pseudoRandom(i, 2) * 3) - 1;
      const engagement = 50 + Math.floor(pseudoRandom(i, 3) * 30) + (days - i) * 0.1;

      metricsData.push({
        date: date.toISOString().split("T")[0],
        users: Math.max(0, baseUsers + userVariation),
        polls: Math.max(0, basePolls + pollVariation),
        engagement: Math.min(100, Math.max(0, engagement)),
      });
    }

    return metricsData;
  }, [timeRange]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: timeRange === "7d" ? undefined : "short",
      day: "numeric",
    });
  };

  const timeRangeOptions = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
  ];

  const gridColor = isDark ? "#404040" : "#e5e5e5";
  const textColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  overflow-hidden">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Platform Metrics
        </h3>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-500" />
          <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800  p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as "7d" | "30d" | "90d")}
                className={`px-3 py-1 text-sm  transition-colors ${
                  timeRange === option.value
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Growth Chart */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            User Growth
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: textColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: textColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#fff",
                    border: `1px solid ${isDark ? "#374151" : "#e5e5e5"}`,
                    borderRadius: "8px",
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Poll Creation and Engagement Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Poll Creation
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fill: textColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: textColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#fff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e5e5"}`,
                      borderRadius: "8px",
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Bar dataKey="polls" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Engagement Rate (%)
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fill: textColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: textColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#fff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e5e5"}`,
                      borderRadius: "8px",
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
