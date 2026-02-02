"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "primary";
  size?: "sm" | "md" | "lg";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <span
        className={cn(
          // Base styles - sharp edges, no rounded
          "inline-flex items-center font-semibold transition-all duration-200",

          // Size variants
          {
            "px-2 py-0.5 text-xs": size === "sm",
            "px-2.5 py-0.5 text-sm": size === "md",
            "px-3 py-1 text-base": size === "lg",
          },

          // Color variants
          {
            // Default - Zinc
            "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200":
              variant === "default",

            // Success - Emerald
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200":
              variant === "success",

            // Warning - Amber
            "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200":
              variant === "warning",

            // Error - Red
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200":
              variant === "error",

            // Primary - Indigo
            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200":
              variant === "primary",
          },

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };