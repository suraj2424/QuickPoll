"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin } = useRoleCheck();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  // Protect the route - redirect non-admin users
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  // Don't render anything while checking role or if not admin
  if (isAdmin === false || isAdmin === null) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          User Management
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage user accounts and roles
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Search size={18} />
          </div>
          <Input
            type="text"
            placeholder="Search by username, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Role Filter */}
        <div className="sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
            className="w-full px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* User Management Table */}
      <UserManagementTable
        searchQuery={searchQuery}
        roleFilter={roleFilter}
      />
    </div>
  );
}
