"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PollDataProvider } from "@/context/PollDataContext";
import { AuthModal } from "@/components/auth/AuthModal";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PollDataProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 ml-72 bg-zinc-50 dark:bg-zinc-950">
          <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
            <div className="space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <AuthModal />
    </PollDataProvider>
  );
}
