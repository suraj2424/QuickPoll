"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  fetchUsers,
  changeUserRole,
  fetchPlatformStats,
  UserManagementRow,
  UserFilters,
  PlatformStats,
} from "@/lib/admin-api";

interface ModerationItem {
  id: number;
  poll_id: number;
  poll_title: string;
  creator_id: number;
  creator_username: string;
  status: "pending" | "flagged" | "approved";
  created_at: string;
}

export interface AdminContextValue {
  // Data
  users: UserManagementRow[];
  moderationQueue: ModerationItem[];
  platformStats: PlatformStats | null;
  
  // Loading states
  isLoadingUsers: boolean;
  isLoadingModeration: boolean;
  isLoadingStats: boolean;
  isUpdatingRole: boolean;
  
  // Error states
  usersError: string | null;
  moderationError: string | null;
  statsError: string | null;
  
  // Actions
  fetchAllUsers: (filters?: UserFilters) => Promise<void>;
  updateUserRole: (
    userId: number,
    newRole: "user" | "admin"
  ) => Promise<void>;
  fetchPlatformStatistics: () => Promise<void>;
  clearUsersError: () => void;
  clearModerationError: () => void;
  clearStatsError: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  // Users state
  const [users, setUsers] = useState<UserManagementRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Moderation state
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [isLoadingModeration, setIsLoadingModeration] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Platform stats state
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Role update state
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Fetch users with optional filtering
  const fetchAllUsers = useCallback(async (filters?: UserFilters) => {
    setIsLoadingUsers(true);
    setUsersError(null);
    
    try {
      const fetchedUsers = await fetchUsers(filters);
      setUsers(fetchedUsers);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch users";
      setUsersError(message);
      throw error;
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // Change user role
  const updateUserRole = useCallback(
    async (userId: number, newRole: "user" | "admin") => {
      setIsUpdatingRole(true);
      setUsersError(null);
      
      try {
        // Get current admin user ID from localStorage
        const storedUser = typeof window !== "undefined"
          ? localStorage.getItem("quickpoll:user")
          : null;
        let adminUserId: number | null = null;
        
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            adminUserId = user.userId ?? null;
          } catch {
            // Ignore parse errors
          }
        }

        if (!adminUserId) {
          throw new Error("Admin user ID not found");
        }

        const updatedUser = await changeUserRole(userId, newRole, adminUserId);
        
        // Update the users list with the modified user
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? updatedUser : user
          )
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update user role";
        setUsersError(message);
        throw error;
      } finally {
        setIsUpdatingRole(false);
      }
    },
    []
  );

  // Fetch platform statistics
  const fetchPlatformStatistics = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    
    try {
      const stats = await fetchPlatformStats();
      setPlatformStats(stats);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch platform statistics";
      setStatsError(message);
      throw error;
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Error clearing functions
  const clearUsersError = useCallback(() => {
    setUsersError(null);
  }, []);

  const clearModerationError = useCallback(() => {
    setModerationError(null);
  }, []);

  const clearStatsError = useCallback(() => {
    setStatsError(null);
  }, []);

  const value: AdminContextValue = {
    users,
    moderationQueue,
    platformStats,
    isLoadingUsers,
    isLoadingModeration,
    isLoadingStats,
    isUpdatingRole,
    usersError,
    moderationError,
    statsError,
    fetchAllUsers,
    updateUserRole,
    fetchPlatformStatistics,
    clearUsersError,
    clearModerationError,
    clearStatsError,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  
  return context;
}
