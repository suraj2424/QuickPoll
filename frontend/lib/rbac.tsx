"use client";

import { ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "./types";

export type UserRole = 'user' | 'admin';

export interface RBACConfig {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Route protection configuration
 * Maps route patterns to their access control rules
 */
export const routeProtection: Record<string, RBACConfig> = {
  '/admin': { allowedRoles: ['admin'], redirectTo: '/dashboard' },
  '/admin/users': { allowedRoles: ['admin'], redirectTo: '/dashboard' },
  '/admin/moderation': { allowedRoles: ['admin'], redirectTo: '/dashboard' },
};

/**
 * Check if a user has one of the required roles
 * @param userRole - The user's current role
 * @param requiredRoles - Array of roles that are allowed
 * @returns true if user has one of the required roles
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if a user can access a specific route
 * @param user - The authenticated user (or null if not authenticated)
 * @param route - The route path to check
 * @returns Object with allowed status and optional redirect path
 */
export function checkRouteAccess(
  user: AuthUser | null,
  route: string
): { allowed: boolean; redirectTo?: string } {
  // Check if route has protection rules
  const protection = routeProtection[route];
  
  if (!protection) {
    // No protection rules, allow access
    return { allowed: true };
  }

  // If user is not authenticated, deny access
  if (!user) {
    return { allowed: false, redirectTo: protection.redirectTo || '/dashboard' };
  }

  // Check if user has required role
  const allowed = hasRole(user.role, protection.allowedRoles);
  
  return {
    allowed,
    redirectTo: allowed ? undefined : protection.redirectTo,
  };
}

/**
 * Higher-order component for route protection
 * Wraps a component and redirects if user doesn't have required role
 * @param Component - The component to protect
 * @param config - RBAC configuration with allowed roles
 * @returns Protected component
 */
export function withRoleProtection<P extends object>(
  Component: ComponentType<P>,
  config: RBACConfig
): ComponentType<P> {
  return function ProtectedComponent(props: P) {
    const router = useRouter();

    useEffect(() => {
      // Get user from localStorage
      const storedUser = typeof window !== 'undefined' 
        ? window.localStorage.getItem('quickpoll:user')
        : null;

      let user: AuthUser | null = null;
      if (storedUser) {
        try {
          user = JSON.parse(storedUser) as AuthUser;
        } catch (error) {
          console.error('Failed to parse stored user', error);
        }
      }

      // Check access
      const { allowed, redirectTo } = checkRouteAccess(user, window.location.pathname);

      if (!allowed && redirectTo) {
        router.push(redirectTo);
      }
    }, [router]);

    return <Component {...props} />;
  };
}
