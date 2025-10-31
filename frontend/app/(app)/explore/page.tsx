"use client";

import { useMemo } from "react";
import { PollCard } from "@/components/polls/PollCard";
import { PollSkeleton } from "@/components/polls/PollSkeleton";
import { usePollData } from "@/context/PollDataContext";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { cn } from "@/lib/utils";

export default function ExplorePage() {
  const {
    activePolls,
    closedPolls,
    featuredClosedPolls,
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

  const busyIds = useMemo(() => busyPollIds, [busyPollIds]);

  const handleVote = (pollId: number) => async (optionId: number) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    try {
      await voteOnPoll(pollId, optionId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = (pollId: number) => () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    togglePollLike(pollId).catch((err) => console.error(err));
  };

  const handleClose = (pollId: number) => () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    closePoll(pollId).catch((err) => console.error(err));
  };

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Live polls</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Discover trending conversations and cast your vote in real time.
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
            {activePolls.length} active poll{activePolls.length === 1 ? "" : "s"}
          </span>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <PollSkeleton key={index} />
            ))}
          </div>
        ) : activePolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-200">No live polls at the moment</p>
            <p className="max-w-sm">
              Check back soon or create a poll to start a new conversation.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activePolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote(poll.id)}
                onToggleLike={handleLike(poll.id)}
                onClose={handleClose(poll.id)}
                isVoting={busyIds.has(poll.id)}
                isLiking={busyIds.has(poll.id)}
                isClosing={busyIds.has(poll.id)}
                interactionsEnabled={isAuthenticated}
                canManage={Boolean(isAuthenticated && user && poll.creator_id === user.userId)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Archived polls</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Review final outcomes and compare how opinions shifted over time.
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
            {closedPolls.length} archived poll{closedPolls.length === 1 ? "" : "s"}
          </span>
        </header>

        {featuredClosedPolls.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
            Closed polls will appear here once they wrap up.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {featuredClosedPolls.map((poll) => (
              <PollCard
                key={`closed-${poll.id}`}
                poll={poll}
                onToggleLike={handleLike(poll.id)}
                interactionsEnabled={isAuthenticated}
                canManage={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
