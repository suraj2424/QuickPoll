"use client";

import Link from "next/link";
import { PlusCircle, BarChart3, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/create-poll",
    label: "Create Poll",
    description: "Start a new poll",
    icon: PlusCircle,
    primary: true,
  },
  {
    href: "/analytics",
    label: "Analytics",
    description: "View insights",
    icon: BarChart3,
  },
  {
    href: "/explore",
    label: "Explore",
    description: "Discover polls",
    icon: Compass,
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "flex items-center gap-3 p-4 transition-colors",
              "border",
              action.primary
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                action.primary
                  ? "text-white dark:text-zinc-900"
                  : "text-zinc-500 dark:text-zinc-400"
              )}
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  action.primary
                    ? "text-white dark:text-zinc-900"
                    : "text-zinc-900 dark:text-zinc-100"
                )}
              >
                {action.label}
              </p>
              <p
                className={cn(
                  "text-xs truncate",
                  action.primary
                    ? "text-zinc-300 dark:text-zinc-600"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {action.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}