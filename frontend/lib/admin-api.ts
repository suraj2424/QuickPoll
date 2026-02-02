import { apiGet, apiPut } from "./api-client";

export interface UserManagementRow {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  polls_created: number;
  total_votes: number;
}

export interface UserFilters {
  search?: string;
  role?: 'user' | 'admin' | 'all';
}

export interface PlatformStats {
  total_users: number;
  active_polls: number;
  total_votes_today: number;
  system_health: 'healthy' | 'degraded' | 'down';
  user_growth_percentage?: number;
}

export interface AdminAction {
  id: number;
  admin_id: number;
  admin_username: string;
  action_type: string;
  target_type: string;
  target_id: number;
  details?: Record<string, unknown>;
  created_at: string;
}

/**
 * Fetch all users with optional filtering
 * @param filters - Optional filters for search and role
 * @returns Array of users with their statistics
 */
export async function fetchUsers(filters?: UserFilters): Promise<UserManagementRow[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    if (filters?.role && filters.role !== 'all') {
      params.append('role', filters.role);
    }

    const queryString = params.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    const result = await apiGet<UserManagementRow[]>(url);
    return result;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users. Please try again.');
  }
}

/**
 * Change a user's role
 * @param userId - The ID of the user to update
 * @param newRole - The new role to assign
 * @param adminUserId - The ID of the admin making the change
 * @returns Updated user information
 */
export async function changeUserRole(
  userId: number,
  newRole: 'user' | 'admin',
  adminUserId: number
): Promise<UserManagementRow> {
  try {
    const result = await apiPut<UserManagementRow>(
      `/auth/users/${userId}/role`,
      { role: newRole, admin_user_id: adminUserId }
    );
    return result;
  } catch (error) {
    console.error('Failed to change user role:', error);
    throw new Error('Failed to change user role. Please try again.');
  }
}

/**
 * Fetch platform statistics
 * @returns Platform-wide statistics and metrics
 */
export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const result = await apiGet<PlatformStats>('/admin/stats');
    return result;
  } catch (error) {
    console.error('Failed to fetch platform stats:', error);
    throw new Error('Failed to fetch platform statistics. Please try again.');
  }
}

/**
 * Fetch admin action audit logs
 * @param limit - Optional limit for number of actions to fetch
 * @returns Array of admin actions from audit log
 */
export async function fetchAdminActions(limit?: number): Promise<AdminAction[]> {
  try {
    const params = new URLSearchParams();
    
    if (limit) {
      params.append('limit', limit.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/admin/actions?${queryString}` : '/admin/actions';
    
    const result = await apiGet<AdminAction[]>(url);
    return result;
  } catch (error) {
    console.error('Failed to fetch admin actions:', error);
    throw new Error('Failed to fetch admin actions. Please try again.');
  }
}
