"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useCallback, type ComponentType } from "react";
import {
  Compass,
  LayoutDashboard,
  LogOut,
  Moon,
  PlusCircle,
  Sun,
  ChevronDown,
  Settings,
  Shield,
  Users,
  Flag,
  Vote,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/rbac";

type IconComponent = ComponentType<{ className?: string }>;

type NavItem = {
  href: string;
  label: string;
  icon: IconComponent;
  requireAuth?: boolean;
};

type NavSection = {
  title?: string;
  items: NavItem[];
  requiresRole?: UserRole;
};

const navSections: NavSection[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/explore", label: "Explore", icon: Compass },
      { href: "/create-poll", label: "Create Poll", icon: PlusCircle, requireAuth: true },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    title: "Admin",
    requiresRole: "admin",
    items: [
      { href: "/admin", label: "Overview", icon: Shield },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/moderation", label: "Moderation", icon: Flag },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, status, logout } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const { hasAccess } = useRoleCheck();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isAuthenticated = status === "authenticated" && Boolean(user);

  const renderNavItem = useCallback(
    (item: NavItem) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      const ItemIcon = item.icon;

      if (item.requireAuth && !isAuthenticated) {
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => openAuthModal("login")}
            className={cn(
              "group flex w-full items-center justify-between px-3 py-2 text-sm",
              "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
              "dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800",
              "transition-colors focus:outline-none"
            )}
          >
            <span className="flex items-center gap-3">
              <ItemIcon className="h-4 w-4" />
              {item.label}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">Sign in</span>
          </button>
        );
      }

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
            "focus:outline-none",
            isActive
              ? "bg-indigo-500 text-white"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <ItemIcon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    },
    [pathname, isAuthenticated, openAuthModal]
  );

  const navigationSections = useMemo(() => {
    return navSections
      .filter((section) => {
        if (section.requiresRole) {
          return hasAccess([section.requiresRole]);
        }
        return true;
      })
      .map((section, index) => (
        <div key={section.title || index}>
          {section.title && (
            <p className="px-3 mb-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">{section.items.map((item) => renderNavItem(item))}</div>
        </div>
      ));
  }, [hasAccess, renderNavItem]);

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
    <aside className="hidden md:flex fixed inset-y-0 z-40 w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {/* Logo Icon */}
          <div className="flex h-8 w-8 items-center justify-center bg-indigo-500">
            <Vote className="h-4 w-4 text-white" />
          </div>
          {/* Logo Text */}
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight">
              <span className="text-zinc-900 dark:text-zinc-100">Quick</span>
              <span className="text-indigo-600 dark:text-indigo-400">Poll</span>
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none">
              Real-time voting
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-6">{navigationSections}</div>
      </nav>

      {/* User Section */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-sm text-left transition-colors",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                userMenuOpen && "bg-zinc-100 dark:bg-zinc-800"
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center bg-indigo-500 text-white text-xs font-semibold">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {user?.username}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {user?.role === "admin" ? "Administrator" : "Member"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-zinc-400 transition-transform duration-200",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg">
                <div className="p-1">
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className={cn(
              "w-full px-4 py-2.5 text-sm font-medium transition-colors text-center",
              "bg-indigo-500 text-white",
              "hover:bg-indigo-600"
            )}
          >
            Sign in
          </button>
        )}
      </div>
    </aside>
  );
}