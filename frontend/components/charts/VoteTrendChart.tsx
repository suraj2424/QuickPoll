"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useTheme } from "next-themes";

interface VoteData {
  date: string;
  votes: number;
  polls: number;
}

interface VoteTrendChartProps {
  title: string;
  data: VoteData[];
  showPolls?: boolean;
}

export function VoteTrendChart({ title, data, showPolls = true }: VoteTrendChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-elevation">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPolls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#404040" : "#e5e5e5"}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke={isDark ? "#a3a3a3" : "#525252"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatNumber}
              stroke={isDark ? "#a3a3a3" : "#525252"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#171717" : "#fff",
                border: `1px solid ${isDark ? "#404040" : "#e5e5e5"}`,
                borderRadius: "4px",
                color: isDark ? "#ededed" : "#171717",
              }}
              formatter={(value, name) => [
                formatNumber(value as number),
                name === "votes" ? "Votes" : "Active Polls",
              ]}
              labelFormatter={(label) => formatDate(label)}
            />
            {showPolls && (
              <>
                <Area
                  type="monotone"
                  dataKey="polls"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="url(#colorPolls)"
                />
                <Line
                  type="monotone"
                  dataKey="polls"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey="votes"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorVotes)"
            />
            <Line
              type="monotone"
              dataKey="votes"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Votes</span>
        </div>
        {showPolls && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-500" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Active Polls</span>
          </div>
        )}
      </div>
    </div>
  );
}
