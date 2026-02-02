"use client";

import { useState } from "react";
import { AuthUser } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/settings-api";
import { cn } from "@/lib/utils";

interface ProfileSettingsProps {
  user: AuthUser;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<{ username?: string; email?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { username?: string; email?: string } = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (username.length > 50) {
      newErrors.username = "Username must be less than 50 characters";
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await updateProfile(user.userId, {
        username: username.trim(),
        email: email.trim() || undefined,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Username Field */}
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) {
                setErrors({ ...errors, username: undefined });
              }
            }}
            variant={errors.username ? "error" : "default"}
            helperText={errors.username}
            placeholder="Enter your username"
            disabled={loading}
          />

          {/* Email Field */}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            variant={errors.email ? "error" : "default"}
            helperText={errors.email}
            placeholder="Enter your email address"
            disabled={loading}
          />

          {/* Account Information */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
              Account
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-500 dark:text-zinc-400">User ID</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {user.userId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-500 dark:text-zinc-400">Role</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
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

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}