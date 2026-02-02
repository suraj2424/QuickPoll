"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { changePassword } from "@/lib/settings-api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function SecuritySettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "New password must be different";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!user) return;

    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await changePassword(user.userId, {
        currentPassword,
        newPassword,
      });

      setMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to change password:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return null;

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "bg-amber-500" };
    if (score <= 4) return { score, label: "Good", color: "bg-blue-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your password</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Password Fields */}
          <div className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) {
                  setErrors({ ...errors, currentPassword: undefined });
                }
              }}
              variant={errors.currentPassword ? "error" : "default"}
              helperText={errors.currentPassword}
              placeholder="Enter current password"
              disabled={loading}
            />

            <div>
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: undefined });
                  }
                }}
                variant={errors.newPassword ? "error" : "default"}
                helperText={errors.newPassword}
                placeholder="Enter new password"
                disabled={loading}
              />

              {/* Password Strength */}
              {strength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Strength
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        strength.score <= 2 && "text-red-600 dark:text-red-400",
                        strength.score === 3 && "text-amber-600 dark:text-amber-400",
                        strength.score === 4 && "text-blue-600 dark:text-blue-400",
                        strength.score === 5 && "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1 bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-300", strength.color)}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              variant={errors.confirmPassword ? "error" : "default"}
              helperText={errors.confirmPassword}
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>

          {/* Requirements */}
          <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-400 dark:text-zinc-500">
              <li>At least 6 characters</li>
              <li>Mix of cases recommended</li>
              <li>Numbers and symbols recommended</li>
            </ul>
          </div>

          {/* Message */}
          {message && (
            <div
              className={cn(
                "p-3 border text-sm",
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
                  : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
              )}
            >
              {message.text}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? "Changing..." : "Change password"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}