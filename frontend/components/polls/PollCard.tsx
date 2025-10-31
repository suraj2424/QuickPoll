"use client";

import { Poll } from "@/lib/types";
import { ButtonHTMLAttributes, MouseEvent, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
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

interface PollOptionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  votes: number;
  totalVotes: number;
  isDark: boolean;
  isWinner?: boolean;
  isClosed?: boolean;
  strengthLabel: string;
  showStrengthTag: boolean;
}

function describeStrength(percentage: number): string {
  if (percentage >= 60) return "Dominant choice";
  if (percentage >= 35) return "Strong contender";
  if (percentage >= 15) return "Gathering momentum";
  if (percentage > 0) return "Gaining traction";
  return "Awaiting votes";
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

function PollOptionButton({
  votes,
  totalVotes,
  className,
  children,
  isDark,
  isWinner,
  isClosed,
  strengthLabel,
  showStrengthTag,
  ...props
}: PollOptionButtonProps) {
  const percentage = totalVotes === 0 ? 0 : (votes / Math.max(totalVotes, 1)) * 100;
  const barWidth = Math.min(100, Math.max(percentage, votes > 0 ? 8 : 0));
  
  // Progress bar colors using proper Tailwind classes
  let barClass = "bg-gradient-to-r from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-500";
  
  if (isWinner) {
    barClass = "bg-gradient-to-r from-emerald-400 to-indigo-500 dark:from-emerald-400 dark:to-indigo-400";
  } else if (percentage >= 50) {
    barClass = "bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500";
  } else if (percentage >= 25) {
    barClass = "bg-gradient-to-r from-indigo-400 to-indigo-500 dark:from-indigo-300 dark:to-indigo-400";
  } else if (percentage > 0) {
    barClass = "bg-gradient-to-r from-indigo-300 to-indigo-400 dark:from-indigo-500 dark:to-indigo-600";
  }

  return (
    <button
      className={cn(
        "w-full group relative flex flex-col gap-2 rounded-lg border p-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm dark:shadow-zinc-900/20",
        "border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50",
        isClosed && "cursor-default hover:bg-white  dark:hover:bg-zinc-800",
        isClosed && isWinner && "border-emerald-300 dark:border-emerald-500",
        className,
      )}
      type="button"
      disabled={isClosed || props.disabled}
      {...props}
    >
      {/* Option text and percentage */}
      <div className="flex w-full items-start justify-between gap-4">
        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 leading-tight flex-1">
          {children}
        </span>
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
          {percentage.toFixed(0)}%
        </span>
      </div>
      
      {/* Vote count and status */}
      <div className="flex w-full items-center justify-between">
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {votes.toLocaleString()} vote{votes === 1 ? "" : "s"}
        </span>
        {showStrengthTag && (
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider",
            isWinner 
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" 
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          )}>
            {isWinner ? "Winner" : "Final"}
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="relative">
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", barClass)}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
      
      {/* Strength description */}
      <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
        {strengthLabel}
      </span>
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isClosed = !poll.is_active;
  const totalVotes = useMemo(
    () => poll.options.reduce((sum, option) => sum + option.vote_count, 0),
    [poll.options],
  );
  const leadingVotes = useMemo(
    () => poll.options.reduce((max, option) => Math.max(max, option.vote_count), 0),
    [poll.options],
  );
  const closesAt = useMemo(() => parseTimestampToDate(poll.closes_at), [poll.closes_at]);
  const updatedAt = useMemo(() => parseTimestampToDate(poll.updated_at), [poll.updated_at]);
  const createdAt = useMemo(() => parseTimestampToDate(poll.created_at), [poll.created_at]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === "undefined" || !closesAt) return;
    setNow(Date.now());
    const intervalMs = poll.is_active ? 1000 : 60000;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [closesAt, poll.is_active]);

  const timingLabel = useMemo(() => {
    if (!closesAt) {
      return poll.is_active ? "No scheduled close" : "Closed manually";
    }
    const diffMs = closesAt.getTime() - now;
    if (poll.is_active) {
      if (diffMs <= 0) {
        return "Closing soon";
      }
      const seconds = Math.max(0, Math.floor(diffMs / 1000));
      return `Closes in ${formatDurationShort(seconds)}`;
    }
    const elapsedMs = now - closesAt.getTime();
    if (elapsedMs < 60_000) {
      return "Closed moments ago";
    }
    const seconds = Math.max(0, Math.floor(elapsedMs / 1000));
    return `Closed ${formatDurationShort(seconds)} ago`;
  }, [closesAt, now, poll.is_active]);

  const canVote = Boolean(onVote && poll.is_active && interactionsEnabled);
  const canLike = Boolean(onToggleLike) && !isClosed && interactionsEnabled && !isLiking;

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
    <article className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 p-4 shadow-sm animate-in fade-in duration-300">
      {/* Header */}
      <header className="mb-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-6 items-center rounded-full px-2.5 text-xs font-bold uppercase tracking-wider",
                poll.is_active
                  ? "bg-indigo-600 text-white animate-pulse dark:bg-indigo-500"
                  : "bg-red-600 text-white dark:bg-red-500"
              )}
            >
              {poll.is_active ? "Live" : "Closed"}
            </span>
            {canManage && poll.is_active && (
              <button
                onClick={onClose}
                className={cn(
                  "flex h-6 items-center rounded-full border px-2.5 text-xs font-medium uppercase tracking-wider transition-smooth focus-ring",
                  "border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white",
                  isClosing && "cursor-not-allowed opacity-70"
                )}
                disabled={isClosing}
              >
                {isClosing ? "Closing…" : "Close poll"}
              </button>
            )}
          </div>
          
          <button
            onClick={handleToggleLike}
            disabled={!canLike}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500",
              poll.user_liked
                ? "border-red-300 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
                : "border-zinc-200 text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400",
              (!canLike || isLiking) && "opacity-50 cursor-not-allowed"
            )}
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill={poll.user_liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{poll.total_likes.toLocaleString()}</span>
          </button>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {poll.title}
          </h2>
          {poll.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {poll.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
          <span className="font-medium">
            {totalVotes.toLocaleString()} total votes
          </span>
          <span>•</span>
          <span className="font-medium">{timingLabel}</span>
        </div>
      </header>

      {/* Poll Options */}
      <div className="space-y-2 mb-4">
        {poll.options.map((option) => {
          const percentage = totalVotes === 0 ? 0 : (option.vote_count / Math.max(totalVotes, 1)) * 100;
          const strengthLabel = describeStrength(percentage);
          const showStrengthTag = isClosed;
          return (
            <PollOptionButton
              key={option.id}
              value={option.id}
              votes={option.vote_count}
              totalVotes={totalVotes}
              isDark={isDark}
              isWinner={!poll.is_active && option.vote_count === leadingVotes && totalVotes > 0}
              isClosed={isClosed}
              strengthLabel={strengthLabel}
              showStrengthTag={showStrengthTag}
              onClick={handleVoteClick}
              disabled={!canVote || isVoting}
            >
              {option.text}
            </PollOptionButton>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-500">
        <span>
          {poll.is_active
            ? `Updated ${updatedAt ? updatedAt.toLocaleString() : "—"}`
            : `Ended ${updatedAt ? updatedAt.toLocaleString() : "—"}`}
        </span>
        <span>Created {createdAt ? createdAt.toLocaleString() : "—"}</span>
      </footer>
    </article>
  );
}
