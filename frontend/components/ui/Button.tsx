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
          // Base styles
          "inline-flex items-center justify-center rounded-lg font-semibold transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
          
          // Size variants
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md", 
            "h-12 px-6 text-base": size === "lg",
          },
          
          // Color variants
          {
            "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800": variant === "primary",
            "bg-background-secondary text-foreground border border-border hover:bg-accent": variant === "secondary",
            "border border-border text-foreground hover:bg-accent hover:border-primary-300": variant === "outline",
            "text-foreground-secondary hover:text-foreground hover:bg-accent": variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          },
          
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