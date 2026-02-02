"use client";

import { forwardRef, type HTMLAttributes, type ComponentType } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-4 p-8 text-center",
          "border-2 border-dashed border-zinc-200 dark:border-zinc-700",
          "bg-zinc-50 dark:bg-zinc-900",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
              {description}
            </p>
          )}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };