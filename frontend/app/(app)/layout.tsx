"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PollDataProvider } from "@/context/PollDataContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

function LoadingFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 w-1/3" />
      <div className="h-32 bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-24 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop Sidebar - hidden on mobile */}
      <AppSidebar />

      {/* Mobile Navigation - shown only on mobile */}
      <MobileNav />

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Show loading until mounted to prevent hydration mismatch (react-hooks/set-state-in-effect)
  if (!mounted) {
    return (
      <LayoutShell>
        <LoadingFallback />
      </LayoutShell>
    );
  }

  // Show loading while auth is verifying
  if (status === "authenticating") {
    return (
      <LayoutShell>
        <LoadingFallback />
      </LayoutShell>
    );
  }

  return (
    <PollDataProvider>
      <LayoutShell>{children}</LayoutShell>
      <AuthModal />
    </PollDataProvider>
  );
}