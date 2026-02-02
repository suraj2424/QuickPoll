"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - sharp edges, no rounded
          "inline-flex items-center justify-center font-semibold transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",

          // Size variants
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },

          // Color variants
          {
            // Primary - Indigo
            "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm focus:ring-indigo-500":
              variant === "primary",

            // Secondary - Zinc
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 focus:ring-zinc-500":
              variant === "secondary",

            // Outline - Transparent with border
            "border border-zinc-300 bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 focus:ring-zinc-500":
              variant === "outline",

            // Ghost - Transparent
            "bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 focus:ring-zinc-500":
              variant === "ghost",

            // Destructive - Red
            "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus:ring-red-500":
              variant === "destructive",
          },

          // Dark mode focus ring offset
          "dark:focus:ring-offset-zinc-900",

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };