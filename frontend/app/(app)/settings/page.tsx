"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { User, Settings as SettingsIcon, Lock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "preferences" | "security" | "account";

const tabs = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "preferences" as const, label: "Preferences", icon: SettingsIcon },
  { id: "security" as const, label: "Security", icon: Lock },
  { id: "account" as const, label: "Account", icon: Shield },
];

export default function SettingsPage() {
  const { user, status } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (status === "authenticating") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-zinc-900 dark:text-zinc-100 font-medium">
            Sign in required
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Please sign in to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <nav className="md:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="md:col-span-3">
          {activeTab === "profile" && <ProfileSettings user={user} />}
          {activeTab === "preferences" && <PreferencesSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "account" && (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Account management features coming soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}