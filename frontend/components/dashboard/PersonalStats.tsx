"use client";

import { BarChart3, Heart, ThumbsUp } from "lucide-react";

interface PersonalStatsProps {
  pollsCreated: number;
  totalVotesReceived: number;
  totalLikesReceived: number;
  loading?: boolean;
}

export function PersonalStats({
  pollsCreated,
  totalVotesReceived,
  totalLikesReceived,
  loading = false,
}: PersonalStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 p-6 shadow-elevation animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-16" />
              </div>
              <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="group bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 p-6 transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-elevation hover:shadow-elevation-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Polls Created
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {pollsCreated.toLocaleString()}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center bg-primary-100 dark:bg-primary-900/50">
            <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>

      <div className="group bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 p-6 transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-elevation hover:shadow-elevation-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Votes Received
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {totalVotesReceived.toLocaleString()}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center bg-success-100 dark:bg-success-900/50">
            <ThumbsUp className="h-6 w-6 text-success-600 dark:text-success-400" />
          </div>
        </div>
      </div>

      <div className="group bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 p-6 transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-elevation hover:shadow-elevation-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Likes Received
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {totalLikesReceived.toLocaleString()}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center bg-error-100 dark:bg-error-900/50">
            <Heart className="h-6 w-6 text-error-600 dark:text-error-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
