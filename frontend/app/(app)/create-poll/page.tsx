"use client";

import { PollForm } from "@/components/forms/PollForm";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { usePollData } from "@/context/PollDataContext";
import { cn } from "@/lib/utils";

export default function CreatePollPage() {
  const { user, status } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const { createPoll, creating } = usePollData();

  const isAuthenticated = status === "authenticated" && Boolean(user);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Create a poll</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Launch a fresh question and invite the community to weigh in with live updates.
        </p>
      </header>

      {isAuthenticated ? (
        <PollForm onSubmit={createPoll} isSubmitting={creating} />
      ) : (
        <div
          className={cn(
            "flex flex-col items-start gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300",
          )}
        >
          <div>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Sign in required</h2>
            <p className="mt-1">
              Create an account or sign in to start publishing polls and tracking the results in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Sign in / Register
          </button>
        </div>
      )}
    </div>
  );
}
