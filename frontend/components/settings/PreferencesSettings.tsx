"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";
import { updatePreferences, fetchPreferences } from "@/lib/settings-api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type ThemePreference = "light" | "dark" | "system";

export function PreferencesSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pollNotifications, setPollNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const prefs = await fetchPreferences(user.userId);
      setThemePreference(prefs.theme);
      setEmailNotifications(prefs.emailNotifications);
      setPollNotifications(prefs.pollNotifications);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const handleThemeChange = (newTheme: ThemePreference) => {
    setThemePreference(newTheme);

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(systemTheme);
    } else {
      setTheme(newTheme);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setMessage(null);
    setLoading(true);

    try {
      await updatePreferences(user.userId, {
        theme: themePreference,
        emailNotifications,
        pollNotifications,
      });

      setMessage({ type: "success", text: "Preferences saved!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save preferences.",
      });
    } finally {
      setLoading(false);
    }
  };

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = themePreference === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    disabled={loading}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 border transition-colors",
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isSelected
                          ? "text-white dark:text-zinc-900"
                          : "text-zinc-600 dark:text-zinc-400"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected
                          ? "text-white dark:text-zinc-900"
                          : "text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
              Notifications
            </h4>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Email notifications
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Updates about your polls and activity
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  disabled={loading}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 items-center transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
                    emailNotifications
                      ? "bg-zinc-900 dark:bg-zinc-100"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform transition-transform",
                      emailNotifications
                        ? "translate-x-5 bg-white dark:bg-zinc-900"
                        : "translate-x-0.5 bg-white dark:bg-zinc-400"
                    )}
                  />
                </button>
              </div>

              {/* Poll Notifications */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Poll notifications
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    When someone votes on your polls
                  </p>
                </div>
                <button
                  onClick={() => setPollNotifications(!pollNotifications)}
                  disabled={loading}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 items-center transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
                    pollNotifications
                      ? "bg-zinc-900 dark:bg-zinc-100"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform transition-transform",
                      pollNotifications
                        ? "translate-x-5 bg-white dark:bg-zinc-900"
                        : "translate-x-0.5 bg-white dark:bg-zinc-400"
                    )}
                  />
                </button>
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

          {/* Save Button */}
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