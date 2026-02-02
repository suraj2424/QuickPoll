"use client";

import { YourPolls } from "@/components/dashboard/YourPolls";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { usePollData } from "@/context/PollDataContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo } from "react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function DashboardPage() {
  const { polls, loading } = usePollData();
  const { user, status } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const [refreshKey, setRefreshKey] = useState(0);

  const userPolls = useMemo(() => {
    if (!user) return [];
    return polls.filter((poll) => poll.creator_id === user.userId);
  }, [polls, user]);

  const stats = useMemo(() => {
    return {
      polls: userPolls.length,
      votes: userPolls.reduce((sum, p) => sum + p.total_votes, 0),
      likes: userPolls.reduce((sum, p) => sum + p.total_likes, 0),
    };
  }, [userPolls]);

  const handlePollClosed = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Unauthenticated
  if (status === "unauthenticated") {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Welcome to QuickPoll
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create polls, gather opinions, and track engagement. Sign in to get started.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Sign in
          </button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
            Or explore what&apos;s happening
          </p>
          <QuickActions />
        </div>
      </div>
    );
  }

  // Loading - now handled by layout-level loading, but keep for poll data loading
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  // Authenticated
  return (
    <div className="max-w-4xl mx-auto space-y-8" key={refreshKey}>
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome back, {user?.username}
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4">
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {stats.polls}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Polls created</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {stats.votes.toLocaleString()}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total votes</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {stats.likes.toLocaleString()}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total likes</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
          Quick actions
        </h2>
        <QuickActions />
      </section>

      {/* Your Polls */}
      <section>
        <YourPolls
          polls={userPolls}
          userId={user!.userId}
          onPollClosed={handlePollClosed}
          loading={loading}
        />
      </section>

      {/* Recent Activity */}
      <section>
        <RecentActivity userPolls={userPolls} personalMode={true} limit={10} />
      </section>
    </div>
  );
}
