"use client";

import { usePollData } from "@/context/PollDataContext";
import { PollCard } from "@/components/polls/PollCard";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { TrendingUp, Sparkles, Zap } from "lucide-react";

export function HighlightsCard() {
  const { stats, featuredClosedPolls, togglePollLike } = usePollData();
  const { user, status } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const isAuthenticated = status === "authenticated" && Boolean(user);

  return (
    <section className="rounded-xl p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Highlights</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Discover standout results and insights across your polling community.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-2">
          <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {stats.totalLikes.toLocaleString()} total likes
          </span>
        </div>
      </header>

      {/* Top Poll Highlight */}
      {stats.topPoll && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Standout Result
            </span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {stats.topPoll.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">
              {stats.topPoll.total_votes.toLocaleString()} votes
            </span>
            <span>•</span>
            <span className="font-semibold">
              {stats.topPoll.total_likes.toLocaleString()} likes
            </span>
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800 p-4 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-700 shadow-sm dark:shadow-zinc-900/20">
          <div className="flex items-start gap-3">
            <div className="flex p-2 h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Predictive Analytics</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                AI-powered insights predict engagement patterns and optimal timing.
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800 p-4 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-700 shadow-sm dark:shadow-zinc-900/20">
          <div className="flex items-start gap-3">
            <div className="flex p-2 h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Real-time Updates</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Live polling results with instant notifications and dynamic charts.
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800 p-4 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-700 shadow-sm dark:shadow-zinc-900/20">
          <div className="flex items-start gap-3">
            <div className="flex p-2 h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 dark:bg-emerald-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Smart Insights</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Advanced analytics reveal voting patterns and audience behavior.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Closed Polls */}
      {featuredClosedPolls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recently Closed</h3>
          <div className="space-y-4">
            {featuredClosedPolls.map((poll) => (
              <PollCard
                key={`highlight-${poll.id}`}
                poll={poll}
                onToggleLike={() => {
                  if (!isAuthenticated) {
                    openAuthModal("login");
                    return;
                  }
                  togglePollLike(poll.id);
                }}
                interactionsEnabled={false}
                canManage={false}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
