"use client";

import { Poll } from "@/lib/types";
import { ButtonHTMLAttributes, MouseEvent, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface PollCardProps {
  poll: Poll;
  onVote?: (optionId: number) => void;
  onToggleLike?: () => void;
  onClose?: () => void;
  isVoting?: boolean;
  isLiking?: boolean;
  isClosing?: boolean;
  interactionsEnabled?: boolean;
  canManage?: boolean;
}

interface PollOptionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  votes: number;
  totalVotes: number;
  isWinner?: boolean;
  isClosed?: boolean;
}

function parseTimestampToDate(value?: string | null): Date | null {
  if (!value) return null;
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDurationShort(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0s";
  const units: { label: string; seconds: number }[] = [
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];
  const parts: string[] = [];
  let remaining = totalSeconds;

  for (const { label, seconds } of units) {
    if (remaining >= seconds || (label === "s" && parts.length === 0)) {
      const value = Math.floor(remaining / seconds);
      if (value > 0 || label === "s") {
        parts.push(`${value}${label}`);
        remaining -= value * seconds;
      }
    }
    if (parts.length === 2) break;
  }

  return parts.join(" ");
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return "Just now";
}

function PollOptionButton({
  votes,
  totalVotes,
  className,
  children,
  isWinner,
  isClosed,
  ...props
}: PollOptionButtonProps) {
  const percentage = totalVotes === 0 ? 0 : (votes / Math.max(totalVotes, 1)) * 100;
  const barWidth = Math.min(100, Math.max(percentage, votes > 0 ? 2 : 0));

  return (
    <button
      className={cn(
        "w-full group relative text-left transition-colors duration-150",
        "border bg-white dark:bg-zinc-900",
        "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1",
        "dark:focus:ring-zinc-500 dark:focus:ring-offset-zinc-900",
        // Default border - very subtle
        "border-zinc-200 dark:border-zinc-800",
        // Interactive states
        !isClosed && [
          "hover:border-zinc-400 dark:hover:border-zinc-600",
          "cursor-pointer",
        ],
        // Closed state
        isClosed && "cursor-default",
        // Winner - subtle green left border accent only
        isWinner && "border-l-2 border-l-emerald-500 dark:border-l-emerald-400",
        className
      )}
      type="button"
      disabled={isClosed || props.disabled}
      {...props}
    >
      {/* Progress bar background - very subtle */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300",
          isWinner
            ? "bg-emerald-50 dark:bg-emerald-950/30"
            : "bg-zinc-50 dark:bg-zinc-800/50"
        )}
        style={{ width: `${barWidth}%` }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-between gap-3 px-3 py-2.5">
        <span className="text-sm text-zinc-800 dark:text-zinc-200 leading-snug">
          {children}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {votes.toLocaleString()}
          </span>
          <span className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300 w-10 text-right">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </button>
  );
}

export function PollCard({
  poll,
  onVote,
  onToggleLike,
  onClose,
  isVoting,
  isLiking,
  isClosing,
  interactionsEnabled = true,
  canManage = false,
}: PollCardProps) {
  const isClosed = !poll.is_active;

  const totalVotes = useMemo(
    () => poll.options.reduce((sum, option) => sum + option.vote_count, 0),
    [poll.options]
  );

  const leadingVotes = useMemo(
    () => poll.options.reduce((max, option) => Math.max(max, option.vote_count), 0),
    [poll.options]
  );

  const closesAt = useMemo(() => parseTimestampToDate(poll.closes_at), [poll.closes_at]);
  const createdAt = useMemo(() => parseTimestampToDate(poll.created_at), [poll.created_at]);

  const [now, setNow] = useState(() => Date.now());

  const hasLikes = poll.total_likes > 0;

  useEffect(() => {
    if (typeof window === "undefined" || !closesAt) return;
    const intervalMs = poll.is_active ? 1000 : 60000;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [closesAt, poll.is_active]);

  const timingLabel = useMemo(() => {
    if (!closesAt) {
      return poll.is_active ? "Open" : "Closed";
    }
    const diffMs = closesAt.getTime() - now;
    if (poll.is_active) {
      if (diffMs <= 0) return "Closing soon";
      const seconds = Math.max(0, Math.floor(diffMs / 1000));
      return formatDurationShort(seconds);
    }
    return "Closed";
  }, [closesAt, now, poll.is_active]);

  const canVote = Boolean(onVote && poll.is_active && interactionsEnabled);
  const canLike = Boolean(onToggleLike) && interactionsEnabled && !isLiking;

  const handleVoteClick = (event: MouseEvent<HTMLButtonElement>) => {
    const optionId = Number(event.currentTarget.value);
    if (!onVote || !canVote) return;
    onVote(optionId);
  };

  const handleToggleLike = () => {
    if (!onToggleLike || !canLike) return;
    onToggleLike();
  };

  return (
    <article className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Header - Title and metadata */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
            {poll.title}
          </h2>
          {/* Status indicator - minimal */}
          <span
            className={cn(
              "shrink-0 text-xs font-medium px-2 py-0.5",
              poll.is_active
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
                : "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800"
            )}
          >
            {poll.is_active ? timingLabel : "Closed"}
          </span>
        </div>

        {poll.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            {poll.description}
          </p>
        )}

        {/* Meta info - single line */}
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
          <span>{totalVotes.toLocaleString()} votes</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span>{createdAt ? formatRelativeTime(createdAt) : "—"}</span>
        </div>
      </div>

      {/* Options */}
      <div className="px-4 pb-3 space-y-1.5">
        {poll.options.map((option) => {
          const isWinner =
            !poll.is_active && option.vote_count === leadingVotes && totalVotes > 0;

          return (
            <PollOptionButton
              key={option.id}
              value={option.id}
              votes={option.vote_count}
              totalVotes={totalVotes}
              isWinner={isWinner}
              isClosed={isClosed}
              onClick={handleVoteClick}
              disabled={!canVote || isVoting}
            >
              {option.text}
            </PollOptionButton>
          );
        })}
      </div>

      {/* Footer - Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
        {/* Like button - minimal */}
        <button
          onClick={handleToggleLike}
          disabled={!canLike}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm transition-colors",
            "focus:outline-none",
            poll.user_liked
              ? "text-rose-500 dark:text-rose-400"
              : "text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400",
            (!canLike || isLiking) && "opacity-50 cursor-not-allowed"
          )}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill={poll.user_liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={poll.user_liked ? "0" : "1.5"}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="tabular-nums">{poll.total_likes.toLocaleString()}</span>
        </button>

        {/* Close poll button - only for managers */}
        {canManage && poll.is_active && (
          <button
            onClick={onClose}
            disabled={isClosing}
            className={cn(
              "text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400",
              "transition-colors focus:outline-none",
              isClosing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isClosing ? "Closing…" : "Close poll"}
          </button>
        )}
      </div>
    </article>
  );
}