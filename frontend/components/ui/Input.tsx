"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error" | "success";
  label?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", label, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            // Base styles - sharp edges, no rounded
            "w-full px-3 py-2 text-sm font-medium transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:border-transparent",
            "bg-white dark:bg-zinc-800 border",
            "disabled:opacity-50 disabled:cursor-not-allowed",

            // Variants
            {
              // Default
              "border-zinc-200 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 focus:ring-indigo-500 dark:focus:ring-indigo-400":
                variant === "default",

              // Error
              "border-red-500 text-red-900 placeholder:text-red-400 dark:border-red-500 dark:text-red-100 dark:placeholder:text-red-400 focus:ring-red-500 dark:focus:ring-red-400":
                variant === "error",

              // Success
              "border-emerald-500 text-emerald-900 placeholder:text-emerald-400 dark:border-emerald-500 dark:text-emerald-100 dark:placeholder:text-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400":
                variant === "success",
            },

            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p
            className={cn("text-xs font-medium transition-colors duration-200", {
              "text-zinc-500 dark:text-zinc-400": variant === "default",
              "text-red-600 dark:text-red-400": variant === "error",
              "text-emerald-600 dark:text-emerald-400": variant === "success",
            })}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };