"use client";

import { Poll } from "@/lib/types";
import { Eye, X } from "lucide-react";
import Link from "next/link";
import { closePollRequest } from "@/lib/polls-api";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface YourPollsProps {
  polls: Poll[];
  userId: number;
  onPollClosed?: (pollId: number) => void;
  loading?: boolean;
}

export function YourPolls({ polls, userId, onPollClosed, loading = false }: YourPollsProps) {
  const [closingPollId, setClosingPollId] = useState<number | null>(null);

  const handleClosePoll = async (pollId: number) => {
    if (!confirm("Close this poll? This cannot be undone.")) {
      return;
    }

    try {
      setClosingPollId(pollId);
      await closePollRequest(pollId, userId);
      onPollClosed?.(pollId);
    } catch (error) {
      console.error("Failed to close poll:", error);
      alert("Failed to close poll. Please try again.");
    } finally {
      setClosingPollId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
          Your polls
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
          Your polls
        </h3>
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            No polls yet
          </p>
          <Link
            href="/create-poll"
            className="text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 underline"
          >
            Create your first poll
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Your polls
        </h3>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {polls.length}
        </span>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-zinc-900"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {poll.title}
                </p>
                <span
                  className={cn(
                    "shrink-0 text-xs",
                    poll.is_active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {poll.is_active ? "Active" : "Closed"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {poll.total_votes} votes · {poll.total_likes} likes
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={`/explore?poll=${poll.id}`}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Link>

              {poll.is_active && (
                <button
                  onClick={() => handleClosePoll(poll.id)}
                  disabled={closingPollId === poll.id}
                  className={cn(
                    "p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors",
                    closingPollId === poll.id && "opacity-50 cursor-not-allowed"
                  )}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}