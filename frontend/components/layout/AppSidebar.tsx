"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  Compass,
  LayoutDashboard,
  LogOut,
  Moon,
  PlusCircle,
  Sun,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string }>;

type NavItem = {
  href: string;
  label: string;
  icon: IconComponent;
  requireAuth?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/create-poll", label: "Create poll", icon: PlusCircle, requireAuth: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, status, logout } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isAuthenticated = status === "authenticated" && Boolean(user);

  const primaryNav = useMemo(
    () =>
      navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const ItemIcon = item.icon;

        if (item.requireAuth && !isAuthenticated) {
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => openAuthModal("login")}
              className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="flex items-center gap-3">
                <ItemIcon className="h-4 w-4 transition-colors group-hover:text-primary-600" />
                {item.label}
              </span>
              <span className="text-xs text-foreground-tertiary">Sign in</span>
            </button>
          );
        }

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <ItemIcon className={cn(
              "h-4 w-4 transition-colors",
              isActive 
                ? "text-white" 
                : "text-zinc-500 group-hover:text-indigo-600 dark:text-zinc-500 dark:group-hover:text-indigo-400"
            )} />
            {item.label}
          </Link>
        );
      }),
    [isAuthenticated, openAuthModal, pathname, theme],
  );

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <aside className="fixed inset-y-0 z-40 flex w-72 flex-col border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 shadow-sm">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-700">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100 transition-colors hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
            Q
          </div>
          QuickPoll
        </Link>
        <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {primaryNav}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 p-4">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                "bg-zinc-50 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100",
                userMenuOpen && "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white text-xs font-semibold">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{user?.username}</p>
                <p className="text-xs text-foreground-tertiary">Account</p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-zinc-500 dark:text-zinc-400 transition-transform",
                userMenuOpen && "rotate-180"
              )} />
            </button>
            
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Join QuickPoll</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Sign in to vote, like, and create polls.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Sign in / Register
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
