"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollChartProps {
  title: string;
  options: PollOption[];
  type?: "bar" | "pie";
}

const COLORS = ["#6366f1", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export function PollChart({ title, options, type = "bar" }: PollChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = options.map((option) => ({
    name: option.text.length > 15 ? option.text.slice(0, 15) + "..." : option.text,
    fullText: option.text,
    votes: option.votes,
  }));

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const pieData = options.map((option, index) => ({
    name: option.text,
    value: option.votes,
    color: COLORS[index % COLORS.length],
  }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (type === "pie") {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-elevation">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name.slice(0, 10)}... (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={isDark ? "#171717" : "#fff"}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#171717" : "#fff",
                  border: `1px solid ${isDark ? "#404040" : "#e5e5e5"}`,
                  borderRadius: "4px",
                  color: isDark ? "#ededed" : "#171717",
                }}
                formatter={(value, name) => [
                  `${formatNumber(value as number)} votes`,
                  name as string,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 "
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {entry.name.length > 20 ? entry.name.slice(0, 20) + "..." : entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-elevation">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {formatNumber(totalVotes)} total votes
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#404040" : "#e5e5e5"}
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={formatNumber}
              stroke={isDark ? "#a3a3a3" : "#525252"}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={isDark ? "#a3a3a3" : "#525252"}
              fontSize={12}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#171717" : "#fff",
                border: `1px solid ${isDark ? "#404040" : "#e5e5e5"}`,
                borderRadius: "4px",
                color: isDark ? "#ededed" : "#171717",
              }}
              formatter={(value, name) => [
                `${formatNumber(value as number)} votes`,
                name === "fullText" ? "Option" : (name as string),
              ]}
              labelFormatter={(label) => data.find((d) => d.name === label)?.fullText || label}
            />
            <Bar
              dataKey="votes"
              fill="#6366f1"
              radius={[0, 4, 4, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
