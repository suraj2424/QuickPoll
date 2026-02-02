"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { RecentAdminActivity } from "@/components/admin/RecentAdminActivity";
import { PlatformMetricsChart } from "@/components/admin/PlatformMetricsChart";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { Shield, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const {
    fetchPlatformStatistics,
    platformStats,
    isLoadingStats,
    statsError,
  } = useAdmin();

  // Check admin access
  const checkAdminAccess = useCallback(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return false;
    }

    if (user && user.role !== "admin") {
      router.push("/dashboard");
      return false;
    }

    return true;
  }, [user, status, router]);

  useEffect(() => {
    if (!checkAdminAccess()) return;
    fetchPlatformStatistics();
  }, [checkAdminAccess, fetchPlatformStatistics]);

  // Show loading while checking auth
  if (status === "authenticating") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Double-check admin role
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 ">
          <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your platform and monitor activity
          </p>
        </div>
      </div>

      {/* Error state */}
      {statsError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-red-700 dark:text-red-300">{statsError}</p>
        </div>
      )}

      {/* Overview Section */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Overview
        </h2>
        <AdminStats
          stats={platformStats}
          isLoading={isLoadingStats}
        />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Quick Actions
        </h2>
        <AdminQuickActions />
      </section>

      {/* Charts Section */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Platform Metrics
        </h2>
        <PlatformMetricsChart />
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Recent Admin Activity
        </h2>
        <RecentAdminActivity />
      </section>
    </div>
  );
}
