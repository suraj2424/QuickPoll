"use client";

import { useEffect, useMemo, useState, useCallback, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  Menu,
  Moon,
  PlusCircle,
  Settings,
  Shield,
  Users,
  Flag,
  Sun,
  X,
  Vote,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useTheme } from "@/context/ThemeContext";
import { UserRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

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

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, status } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const { hasAccess } = useRoleCheck();
  const isAuthenticated = status === "authenticated" && Boolean(user);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
        <div key={section.title || index} className="space-y-1">
          {section.title && (
            <p className="px-3 pt-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">{section.items.map((item) => renderNavItem(item))}</div>
        </div>
      ));
  }, [hasAccess, renderNavItem]);

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
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-zinc-900 pt-14">
          <nav className="p-4 space-y-3 overflow-y-auto h-full">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-800/60">
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Theme</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  {theme === "dark" ? "Dark" : "Light"}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            <div className="space-y-3">{navigationSections}</div>

            {!isAuthenticated && (
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
          </nav>
        </div>
      )}

      {/* Spacer for fixed header on mobile */}
      <div className="md:hidden h-14" />
    </>
  );
}
