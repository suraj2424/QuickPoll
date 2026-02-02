"use client";

import { useState, useEffect } from "react";
import { fetchActivities, type ActivityItem } from "@/lib/analytics-api";
import { Poll } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  activities?: ActivityItem[];
  limit?: number;
  userPolls?: Poll[];
  personalMode?: boolean;
}

const fallbackActivities: ActivityItem[] = [
  { id: "1", type: "vote", user_id: 1, username: "john_doe", poll_id: 1, poll_title: "Favorite Programming Language 2024", timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), metadata: null },
  { id: "2", type: "like", user_id: 2, username: "jane_smith", poll_id: 2, poll_title: "Best Framework for Web Development", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), metadata: null },
  { id: "3", type: "created", user_id: 3, username: "dev_master", poll_id: 3, poll_title: "React vs Vue vs Angular", timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), metadata: null },
];

function formatTime(timestamp: string): string {
  // Parse the ISO timestamp - handle various formats
  let date: Date;
  
  // If timestamp doesn't have timezone, assume UTC
  if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !/[+-]\d{2}:?\d{2}$/.test(timestamp)) {
    // Append Z to indicate UTC if no timezone info
    date = new Date(timestamp + 'Z');
  } else {
    date = new Date(timestamp);
  }
  
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return "unknown";
  }
  
  // Get current time
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = now.getTime() - date.getTime();
  
  // Use absolute value for display
  const diffAbs = Math.abs(diffMs);
  const mins = Math.floor(diffAbs / 60000);
  const hours = Math.floor(diffAbs / 3600000);
  const days = Math.floor(diffAbs / 86400000);

  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  // For older dates, format in local timezone
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getActionText(type: string): string {
  switch (type) {
    case "vote": return "voted on";
    case "like": return "liked";
    case "share": return "shared";
    case "created": return "created";
    case "follow": return "followed";
    default: return "interacted with";
  }
}

export function RecentActivity({
  activities: initialActivities,
  limit = 10,
  userPolls,
  personalMode = false,
}: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities || []);
  const [loading, setLoading] = useState(!initialActivities);

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const data = await fetchActivities(limit);
        setActivities(data.activities);
      } catch {
        setActivities(fallbackActivities);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [initialActivities, limit]);

  // Filter to user's polls if in personal mode
  const userPollIds = userPolls ? new Set(userPolls.map((p) => p.id)) : null;
  const filtered =
    personalMode && userPollIds
      ? activities.filter((a) => a.poll_id && userPollIds.has(a.poll_id))
      : activities;

  const displayed = filtered.slice(0, limit);

  if (loading) {
    return (
      <div>
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
          {personalMode ? "Activity on your polls" : "Recent activity"}
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
          {personalMode ? "Activity on your polls" : "Recent activity"}
        </h3>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">
          {personalMode ? "No activity yet" : "No recent activity"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
        {personalMode ? "Activity on your polls" : "Recent activity"}
      </h3>

      <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {displayed.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {activity.username}
              </span>{" "}
              {getActionText(activity.type)}{" "}
              <span className="text-zinc-900 dark:text-zinc-100">
                {activity.poll_title}
              </span>
            </p>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
              {formatTime(activity.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}