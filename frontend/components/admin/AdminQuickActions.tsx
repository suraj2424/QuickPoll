"use client";

import Link from "next/link";
import {
  Users,
  Shield,
  BarChart3,
  Settings,
  UserCog,
  FileText,
} from "lucide-react";

export function AdminQuickActions() {
  const actions = [
    {
      label: "User Management",
      description: "Manage user accounts and roles",
      href: "/admin/users",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Content Moderation",
      description: "Review and moderate poll content",
      href: "/admin/moderation",
      icon: Shield,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      label: "View Reports",
      description: "Access detailed analytics reports",
      href: "/analytics",
      icon: BarChart3,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Platform Settings",
      description: "Configure platform-wide settings",
      href: "/settings",
      icon: Settings,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  p-6 hover:shadow-elevation transition-all hover:border-primary-300 dark:hover:border-primary-700"
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-2  ${action.bgColor} group-hover:scale-110 transition-transform`}
            >
              <action.icon className={`h-5 w-5 ${action.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {action.label}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {action.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
