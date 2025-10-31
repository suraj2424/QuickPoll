"use client";

import { HighlightsCard } from "@/components/dashboard/HighlightsCard";
import { usePollData } from "@/context/PollDataContext";
import { Activity, BarChart3, Users, Heart, TrendingUp, Trophy } from "lucide-react";

export default function DashboardPage() {
  const { stats } = usePollData();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <section className="rounded-xl p-8">
        
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  <Activity className="h-3 w-3" />
                  Live Dashboard
                </span>

              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Welcome back</h1>
            </div>
          </div>
          <p className="max-w-3xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Monitor real-time engagement, track community participation, and discover trending polls across your platform.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800/40 p-6 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Polls</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.activeCount.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800/40 p-6 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Closed Polls</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.closedCount.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                <BarChart3 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800/40 p-6 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Votes</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalVotes.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800/40 p-6 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Likes</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalLikes.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800/40 p-6 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Participation</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.participationRate}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {stats.topPoll && (
            <div className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800/40 p-6 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Top Performer</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">{stats.topPoll.title}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Highlights Section */}
      <HighlightsCard />
    </div>
  );
}
