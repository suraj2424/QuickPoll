"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { PollCard } from "@/components/polls/PollCard";
import { PollSkeleton } from "@/components/polls/PollSkeleton";
import { usePollData } from "@/context/PollDataContext";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import type { Poll } from "@/lib/types";

type FilterStatus = "all" | "active" | "closed";
type SortOption = "recent" | "popular" | "votes";

export default function ExplorePage() {
  const {
    activePolls,
    closedPolls,
    loading,
    error,
    busyPollIds,
    voteOnPoll,
    togglePollLike,
    closePoll,
  } = usePollData();
  const { user, status } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const isAuthenticated = status === "authenticated" && Boolean(user);

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter and sort polls
  const polls = useMemo(() => {
    let result: Poll[] = [];

    if (filter === "all") {
      result = [...activePolls, ...closedPolls];
    } else if (filter === "active") {
      result = [...activePolls];
    } else {
      result = [...closedPolls];
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (sort === "recent") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === "popular") {
      result.sort((a, b) => b.total_likes - a.total_likes);
    } else {
      result.sort((a, b) => b.total_votes - a.total_votes);
    }

    return result;
  }, [activePolls, closedPolls, filter, debouncedSearch, sort]);

  const clearAll = useCallback(() => {
    setFilter("all");
    setSort("recent");
    setSearch("");
  }, []);

  const hasFilters = filter !== "all" || sort !== "recent" || search.trim() !== "";

  const handleVote = (pollId: number) => async (optionId: number) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    await voteOnPoll(pollId, optionId).catch(console.error);
  };

  const handleLike = (pollId: number) => () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    togglePollLike(pollId).catch(console.error);
  };

  const handleClose = (pollId: number) => () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    closePoll(pollId).catch(console.error);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Explore
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Discover and vote on community polls
        </p>
      </header>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full py-2 pl-9 pr-9 text-sm",
              "bg-white dark:bg-zinc-900",
              "border border-zinc-200 dark:border-zinc-800",
              "text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            )}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {(["all", "active", "closed"] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === f
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className={cn(
                "py-1.5 px-2 text-sm",
                "bg-white dark:bg-zinc-900",
                "border border-zinc-200 dark:border-zinc-800",
                "text-zinc-700 dark:text-zinc-300",
                "focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              )}
            >
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
              <option value="votes">Most voted</option>
            </select>

            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="text-xs text-zinc-500 dark:text-zinc-500">
          {polls.length} {polls.length === 1 ? "poll" : "polls"}
          {debouncedSearch && ` matching "${debouncedSearch}"`}
        </div>
      </div>

      {/* Content */}
      <section>
        {error && (
          <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <PollSkeleton key={i} />
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              {search.trim() ? "No polls match your search" : "No polls yet"}
            </p>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="mt-3 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote(poll.id)}
                onToggleLike={handleLike(poll.id)}
                onClose={handleClose(poll.id)}
                isVoting={busyPollIds.has(poll.id)}
                isLiking={busyPollIds.has(poll.id)}
                isClosing={busyPollIds.has(poll.id)}
                interactionsEnabled={isAuthenticated}
                canManage={Boolean(isAuthenticated && user && poll.creator_id === user.userId)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}