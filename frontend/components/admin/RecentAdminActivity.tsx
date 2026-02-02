"use client";

import { useEffect, useState } from "react";
import { fetchAdminActions, AdminAction } from "@/lib/admin-api";
import {
  User,
  Shield,
  FileText,
  Trash2,
  Edit,
  MoreHorizontal,
} from "lucide-react";

export function RecentAdminActivity() {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActions = async () => {
      try {
        setIsLoading(true);
        const fetchedActions = await fetchAdminActions(10);
        setActions(fetchedActions);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load activity"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadActions();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  p-6 text-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          No recent admin activity
        </p>
      </div>
    );
  }

  const getActionIcon = (actionType: string) => {
    const type = actionType.toLowerCase();
    if (type.includes("role")) return User;
    if (type.includes("delete") || type.includes("remove")) return Trash2;
    if (type.includes("edit") || type.includes("update")) return Edit;
    if (type.includes("poll")) return FileText;
    if (type.includes("moderation")) return Shield;
    return MoreHorizontal;
  };

  const getActionColor = (actionType: string) => {
    const type = actionType.toLowerCase();
    if (type.includes("delete") || type.includes("remove")) {
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
    }
    if (type.includes("role")) {
      return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
    }
    if (type.includes("edit") || type.includes("update")) {
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
    }
    return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
  }

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`;
    }
    return date.toLocaleDateString();
  };;

  const formatActionType = (actionType: string) => {
    return actionType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  overflow-hidden">
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {actions.map((action) => {
          const Icon = getActionIcon(action.action_type);
          const iconColorClass = getActionColor(action.action_type);

          return (
            <div
              key={action.id}
              className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div
                className={`p-2 rounded-full ${iconColorClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {formatActionType(action.action_type)} on{" "}
                  {action.target_type}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                  Target ID: {action.target_id}
                  {action.details &&
                    Object.keys(action.details).length > 0 && (
                      <span className="ml-2">
                        (
                        {Object.entries(action.details)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                        )
                      </span>
                    )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {action.admin_username}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {getRelativeTime(action.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
