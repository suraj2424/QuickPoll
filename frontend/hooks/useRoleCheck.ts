"use client";

import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/rbac";

interface RoleCheckResult {
  role: UserRole | null;
  isAdmin: boolean;
  isUser: boolean;
  hasAccess: (requiredRoles: UserRole[]) => boolean;
}

/**
 * Custom hook for checking user roles and permissions
 * @returns Object with role information and permission check functions
 */
export function useRoleCheck(): RoleCheckResult {
  const { user } = useAuth();

  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  /**
   * Check if the current user has access based on required roles
   * @param requiredRoles - Array of roles that are allowed
   * @returns true if user has one of the required roles, false otherwise
   */
  const hasAccess = (requiredRoles: UserRole[]): boolean => {
    if (!role) {
      return false;
    }
    return requiredRoles.includes(role);
  };

  return {
    role,
    isAdmin,
    isUser,
    hasAccess,
  };
}
