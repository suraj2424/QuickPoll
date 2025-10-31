"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { usePollFeed } from "@/hooks/usePollFeed";
import type { Poll } from "@/lib/types";

interface PollStats {
  totalVotes: number;
  totalLikes: number;
  activeCount: number;
  closedCount: number;
  topPoll: Poll | null;
  participationRate: number;
}

interface PollDataContextValue {
  polls: Poll[];
  activePolls: Poll[];
  closedPolls: Poll[];
  featuredClosedPolls: Poll[];
  stats: PollStats;
  loading: boolean;
  error: string | null;
  creating: boolean;
  busyPollIds: Set<number>;
  createPoll: ReturnType<typeof usePollFeed>["createPoll"];
  voteOnPoll: ReturnType<typeof usePollFeed>["voteOnPoll"];
  togglePollLike: ReturnType<typeof usePollFeed>["togglePollLike"];
  closePoll: ReturnType<typeof usePollFeed>["closePoll"];
  refresh: ReturnType<typeof usePollFeed>["refresh"];
}

const PollDataContext = createContext<PollDataContextValue | undefined>(undefined);

export function PollDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const feed = usePollFeed({ user });

  const value = useMemo<PollDataContextValue>(() => {
    const { polls, activePolls, closedPolls } = feed;

    const stats: PollStats = (() => {
      const totalVotes = polls.reduce((sum, poll) => sum + poll.total_votes, 0);
      const totalLikes = polls.reduce((sum, poll) => sum + poll.total_likes, 0);
      const activeCount = activePolls.length;
      const closedCount = closedPolls.length;
      const topPoll = closedPolls.reduce<Poll | null>((best, poll) => {
        if (!best || poll.total_votes > best.total_votes) return poll;
        return best;
      }, null);
      const participationRate = polls.length === 0 ? 0 : Math.round((totalVotes / (polls.length * 100)) * 100);
      return {
        totalVotes,
        totalLikes,
        activeCount,
        closedCount,
        topPoll,
        participationRate,
      };
    })();

    const featuredClosedPolls = [...closedPolls]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 4);

    return {
      polls,
      activePolls,
      closedPolls,
      featuredClosedPolls,
      stats,
      loading: feed.loading,
      error: feed.error,
      creating: feed.creating,
      busyPollIds: feed.busyPollIds,
      createPoll: feed.createPoll,
      voteOnPoll: feed.voteOnPoll,
      togglePollLike: feed.togglePollLike,
      closePoll: feed.closePoll,
      refresh: feed.refresh,
    };
  }, [feed]);

  return <PollDataContext.Provider value={value}>{children}</PollDataContext.Provider>;
}

export function usePollData() {
  const ctx = useContext(PollDataContext);
  if (!ctx) {
    throw new Error("usePollData must be used within PollDataProvider");
  }
  return ctx;
}
