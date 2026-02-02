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
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">Create a poll</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Launch a fresh question and invite the community to weigh in with live updates.
        </p>
      </header>

      {isAuthenticated ? (
        <PollForm onSubmit={createPoll} isSubmitting={creating} />
      ) : (
        <div
          className={cn(
            "flex flex-col items-start gap-4 border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-600 shadow-elevation dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-300",
          )}
        >
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Sign in required</h2>
            <p className="mt-1">
              Create an account or sign in to start publishing polls and tracking the results in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Sign in / Register
          </button>
        </div>
      )}
    </div>
  );
}
