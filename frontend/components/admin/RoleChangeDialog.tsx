"use client";

import { useState } from "react";
import { UserManagementRow } from "@/lib/admin-api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, AlertTriangle, Shield, User as UserIcon } from "lucide-react";

interface RoleChangeDialogProps {
  user: UserManagementRow;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: number, newRole: 'user' | 'admin') => Promise<void>;
}

export function RoleChangeDialog({ user, open, onClose, onConfirm }: RoleChangeDialogProps) {
  const [newRole, setNewRole] = useState<'user' | 'admin'>(user.role === 'admin' ? 'user' : 'admin');
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm(user.id, newRole);
      setSuccess(true);
      // Close after a brief delay to show success message
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(false);
      setReason("");
    }
  };

  const isPromoting = newRole === 'admin';
  const isDemoting = newRole === 'user';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-md w-full mx-4 p-6 z-10">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Change User Role
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Update role permissions for this user
          </p>
        </div>

        {/* User Details */}
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Username:
              </span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {user.username}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email:
              </span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {user.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Current Role:
              </span>
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
            </div>
          </div>
        </div>

        {/* New Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            New Role
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setNewRole('user')}
              disabled={loading}
              className={`flex-1 p-3 border-2 transition-all ${
                newRole === 'user'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserIcon size={18} />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">User</span>
              </div>
            </button>
            <button
              onClick={() => setNewRole('admin')}
              disabled={loading}
              className={`flex-1 p-3 border-2 transition-all ${
                newRole === 'admin'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield size={18} />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Admin</span>
              </div>
            </button>
          </div>
        </div>

        {/* Warning Message */}
        {newRole !== user.role && (
          <div className="mb-6 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 flex gap-3">
            <AlertTriangle size={20} className="text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-warning-900 dark:text-warning-100 mb-1">
                {isPromoting ? 'Promoting to Admin' : 'Demoting to User'}
              </p>
              <p className="text-warning-700 dark:text-warning-300">
                {isPromoting
                  ? 'This user will gain access to admin features including user management, content moderation, and platform analytics.'
                  : 'This user will lose access to all admin features and will only have standard user permissions.'}
              </p>
            </div>
          </div>
        )}

        {/* Optional Reason */}
        <div className="mb-6">
          <Input
            label="Reason (optional)"
            placeholder="Enter reason for role change..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-sm text-error-700 dark:text-error-300">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 text-sm text-success-700 dark:text-success-300">
            Role changed successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant={isDemoting ? "destructive" : "primary"}
            disabled={loading || newRole === user.role}
            className="flex-1"
          >
            {loading ? 'Changing...' : 'Confirm Change'}
          </Button>
        </div>
      </div>
    </div>
  );
}
