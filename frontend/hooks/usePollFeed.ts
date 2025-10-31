"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPoll,
  fetchPoll,
  fetchPolls,
  castVote,
  toggleLike,
  closePollRequest,
} from "@/lib/polls-api";
import { AuthUser, Poll, PollCreatePayload } from "@/lib/types";
import { useWebSocket } from "@/hooks/useWebSocket";

interface UsePollFeedOptions {
  user: AuthUser | null;
}

type PollSocketMessage = {
  type?: string;
  poll_id?: number;
  payload?: Record<string, unknown> | null;
  [key: string]: unknown;
};

interface UsePollFeedResult {
  polls: Poll[];
  activePolls: Poll[];
  closedPolls: Poll[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  busyPollIds: Set<number>;
  createPoll: (payload: PollCreatePayload) => Promise<void>;
  voteOnPoll: (pollId: number, optionId: number) => Promise<void>;
  togglePollLike: (pollId: number) => Promise<void>;
  closePoll: (pollId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

function parseMessage(event: MessageEvent<string>): PollSocketMessage | null {
  try {
    const parsed = JSON.parse(event.data);
    if (parsed && typeof parsed === "object" && "message" in parsed) {
      const message = (parsed as { message: unknown }).message;
      if (typeof message === "string") {
        try {
          return JSON.parse(message);
        } catch (innerError) {
          console.warn("Failed to parse inner websocket payload", innerError);
          return null;
        }
      }
      if (typeof message === "object" && message !== null) {
        return message as PollSocketMessage;
      }
      return null;
    }
    return parsed as PollSocketMessage;
  } catch (error) {
    console.warn("Failed to parse websocket message", error);
    return null;
  }
}

function extractPollId(message: PollSocketMessage | null): number | null {
  if (!message) return null;
  if (typeof message.poll_id === "number") return message.poll_id;
  const payload = message.payload;
  if (
    payload &&
    typeof payload === "object" &&
    "poll_id" in payload &&
    typeof (payload as Record<string, unknown>).poll_id === "number"
  ) {
    return (payload as { poll_id: number }).poll_id;
  }
  return null;
}

export function usePollFeed({ user }: UsePollFeedOptions): UsePollFeedResult {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [busyPollIds, setBusyPollIds] = useState<Set<number>>(new Set());

  const userId = user?.userId;

  const pollById = useMemo(() => {
    const map = new Map<number, Poll>();
    polls.forEach((poll) => {
      map.set(poll.id, poll);
    });
    return map;
  }, [polls]);

  const activePolls = useMemo(() => polls.filter((poll) => poll.is_active), [polls]);
  const closedPolls = useMemo(() => polls.filter((poll) => !poll.is_active), [polls]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPolls(userId);
      setPolls(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load polls");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updatePollInState = useCallback((updated: Poll) => {
    setPolls((current) => {
      const exists = current.some((poll) => poll.id === updated.id);
      if (exists) {
        return current.map((poll) => (poll.id === updated.id ? updated : poll));
      }
      return [updated, ...current];
    });
  }, []);

  const markBusy = useCallback((pollId: number) => {
    setBusyPollIds((prev) => new Set(prev).add(pollId));
  }, []);

  const unmarkBusy = useCallback((pollId: number) => {
    setBusyPollIds((prev) => {
      const next = new Set(prev);
      next.delete(pollId);
      return next;
    });
  }, []);

  const handleSocketMessage = useCallback(
    async (event: MessageEvent<string>) => {
      const message = parseMessage(event);
      const pollId = extractPollId(message);

      if (message?.type === "poll_deleted" && pollId !== null) {
        setPolls((current) => current.filter((poll) => poll.id !== pollId));
        setBusyPollIds((prev) => {
          if (!prev.has(pollId)) return prev;
          const next = new Set(prev);
          next.delete(pollId);
          return next;
        });
        return;
      }

      if (message?.type === "poll_closed" && pollId !== null) {
        try {
          const updated = await fetchPoll(pollId, userId);
          updatePollInState(updated);
        } catch (err) {
          console.error("Failed to load closed poll", err);
        }
        return;
      }

      if (pollId === null) return;

      try {
        const updated = await fetchPoll(pollId, userId);
        updatePollInState(updated);
      } catch (err) {
        console.error("Failed to sync poll", err);
      }
    },
    [updatePollInState, userId],
  );

  const { sendMessage } = useWebSocket({
    path: "/ws",
    onMessage: handleSocketMessage,
    shouldReconnect: true,
  });

  const handleCreatePoll = useCallback(
    async (payload: PollCreatePayload) => {
      if (!userId) throw new Error("You must be logged in to create a poll");
      setCreating(true);
      try {
        const newPoll = await createPoll(payload, userId);
        updatePollInState(newPoll);
        sendMessage({ type: "poll_updated", poll_id: newPoll.id });
      } catch (err) {
        console.error(err);
        setError("Unable to create poll. Please try again.");
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [sendMessage, updatePollInState, userId],
  );

  const handleVote = useCallback(
    async (pollId: number, optionId: number) => {
      if (!userId) throw new Error("You must be logged in to vote");
      const poll = pollById.get(pollId);
      if (poll && !poll.is_active) {
        setError("This poll has already closed.");
        return;
      }
      markBusy(pollId);
      try {
        await castVote(pollId, optionId, userId);
        const updatedPoll = await fetchPoll(pollId, userId);
        updatePollInState(updatedPoll);
        sendMessage({ type: "poll_updated", poll_id: pollId });
      } catch (err) {
        console.error(err);
        setError("Unable to submit vote. Please try again.");
        throw err;
      } finally {
        unmarkBusy(pollId);
      }
    },
    [markBusy, pollById, sendMessage, unmarkBusy, updatePollInState, userId],
  );

  const handleToggleLike = useCallback(
    async (pollId: number) => {
      if (!userId) throw new Error("You must be logged in to like a poll");
      markBusy(pollId);
      let previousSnapshot: Poll | undefined;
      try {
        previousSnapshot = polls.find((poll) => poll.id === pollId);
        if (previousSnapshot) {
          const optimistic = {
            ...previousSnapshot,
            total_likes: previousSnapshot.user_liked
              ? Math.max(0, previousSnapshot.total_likes - 1)
              : previousSnapshot.total_likes + 1,
            user_liked: !previousSnapshot.user_liked,
          };
          updatePollInState(optimistic);
        }

        await toggleLike(pollId, userId);
        const updatedPoll = await fetchPoll(pollId, userId);
        updatePollInState(updatedPoll);
        sendMessage({ type: "poll_updated", poll_id: pollId });
      } catch (err) {
        console.error(err);
        if (previousSnapshot) {
          updatePollInState(previousSnapshot);
        }
        setError("Unable to update like. Please try again.");
        throw err;
      } finally {
        unmarkBusy(pollId);
      }
    },
    [markBusy, polls, sendMessage, unmarkBusy, updatePollInState, userId],
  );

  const handleClosePoll = useCallback(
    async (pollId: number) => {
      if (!userId) throw new Error("You must be logged in to manage polls");
      markBusy(pollId);
      try {
        const closedPoll = await closePollRequest(pollId, userId);
        updatePollInState(closedPoll);
      } catch (err) {
        console.error(err);
        setError("Unable to close poll. Please try again.");
        throw err;
      } finally {
        unmarkBusy(pollId);
      }
    },
    [markBusy, unmarkBusy, updatePollInState, userId],
  );

  return useMemo(
    () => ({
      polls,
      activePolls,
      closedPolls,
      loading,
      error,
      creating,
      busyPollIds,
      pollById,
      createPoll: handleCreatePoll,
      voteOnPoll: handleVote,
      togglePollLike: handleToggleLike,
      closePoll: handleClosePoll,
      refresh,
    }),
    [
      activePolls,
      pollById,
      busyPollIds,
      creating,
      error,
      handleCreatePoll,
      handleClosePoll,
      handleToggleLike,
      handleVote,
      loading,
      closedPolls,
      polls,
      refresh,
    ],
  );
}
