"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchUsers, changeUserRole, UserManagementRow } from "@/lib/admin-api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RoleChangeDialog } from "./RoleChangeDialog";
import { ArrowUpDown, ChevronLeft, ChevronRight, Shield, User as UserIcon } from "lucide-react";

interface UserManagementTableProps {
  searchQuery: string;
  roleFilter: 'all' | 'user' | 'admin';
}

type SortField = 'username' | 'email' | 'role' | 'created_at' | 'polls_created' | 'total_votes';
type SortDirection = 'asc' | 'desc';

export function UserManagementTable({ searchQuery, roleFilter }: UserManagementTableProps) {
  const [users, setUsers] = useState<UserManagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserManagementRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const itemsPerPage = 10;

  // Fetch users on mount and when filters change
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toString().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date strings
      if (sortField === 'created_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRoleChangeClick = (user: UserManagementRow) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleRoleChangeConfirm = async (userId: number, newRole: 'user' | 'admin') => {
    try {
      // Get the current admin user from localStorage
      const storedUser = typeof window !== 'undefined' 
        ? window.localStorage.getItem('quickpoll:user')
        : null;
      
      if (!storedUser) {
        throw new Error('Admin user not found');
      }
      
      const adminUser = JSON.parse(storedUser);
      await changeUserRole(userId, newRole, adminUser.userId);
      // Reload users to get updated data
      await loadUsers();
      setIsDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to change role:', err);
      throw err; // Let the dialog handle the error display
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
    >
      {children}
      <ArrowUpDown size={14} className={sortField === field ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'} />
    </button>
  );

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">Loading users...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="text-error-600 dark:text-error-400">{error}</div>
          <Button onClick={loadUsers} variant="primary" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        {/* Results count */}
        <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <SortButton field="username">Username</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <SortButton field="email">Email</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <SortButton field="role">Role</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <SortButton field="created_at">Join Date</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <SortButton field="polls_created">Polls</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <SortButton field="total_votes">Votes</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-600 dark:text-neutral-400">
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                            : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {user.polls_created}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {user.total_votes}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        onClick={() => handleRoleChangeClick(user)}
                        variant="outline"
                        size="sm"
                      >
                        Change Role
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Role Change Dialog */}
      {selectedUser && (
        <RoleChangeDialog
          user={selectedUser}
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleRoleChangeConfirm}
        />
      )}
    </>
  );
}
