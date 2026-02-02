"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

// ... nav items ...

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header - only visible on mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <Vote className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Quick<span className="text-indigo-600 dark:text-indigo-400">Poll</span>
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-600 dark:text-zinc-400"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-zinc-900 pt-14">
          <nav className="p-4 space-y-1">
            {/* Nav items here */}
          </nav>
        </div>
      )}

      {/* Spacer for fixed header on mobile */}
      <div className="md:hidden h-14" />
    </>
  );
}