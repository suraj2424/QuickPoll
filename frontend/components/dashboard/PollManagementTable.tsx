"use client";

import { useState } from "react";
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Trash2, Edit2 } from "lucide-react";

interface Poll {
  id: string;
  title: string;
  author: string;
  status: "active" | "closed";
  votes: number;
  likes: number;
  createdAt: string;
}

interface PollManagementTableProps {
  polls?: Poll[];
}

// Mock data for demonstration
const mockPolls: Poll[] = [
  { id: "1", title: "Favorite Programming Language 2024", author: "john_doe", status: "active", votes: 1234, likes: 89, createdAt: "2024-01-15" },
  { id: "2", title: "Best Framework for Web Development", author: "jane_smith", status: "active", votes: 856, likes: 67, createdAt: "2024-01-14" },
  { id: "3", title: "React vs Vue vs Angular", author: "dev_master", status: "closed", votes: 2341, likes: 156, createdAt: "2024-01-10" },
  { id: "4", title: "TypeScript vs JavaScript", author: "code_ninja", status: "active", votes: 567, likes: 34, createdAt: "2024-01-13" },
  { id: "5", title: "Docker vs Kubernetes", author: "ops_guru", status: "closed", votes: 789, likes: 45, createdAt: "2024-01-08" },
];

export function PollManagementTable({ polls = mockPolls }: PollManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all");
  const [selectedPolls, setSelectedPolls] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredPolls = polls.filter((poll) => {
    const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         poll.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || poll.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedPolls.size === filteredPolls.length) {
      setSelectedPolls(new Set());
    } else {
      setSelectedPolls(new Set(filteredPolls.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedPolls);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPolls(newSelected);
  };

  const handleBulkClose = () => {
    // In production, this would call an API to close the selected polls
    console.log("Closing polls:", Array.from(selectedPolls));
    setSelectedPolls(new Set());
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    // In production, this would call an API to delete the poll
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsDeleting(null);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-elevation">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Poll Management</h3>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700  bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "closed")}
                className="pl-10 pr-8 py-2 border border-neutral-200 dark:border-neutral-700  bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedPolls.size > 0 && (
              <button
                onClick={handleBulkClose}
                className="flex items-center gap-2 px-4 py-2 bg-warning-500 text-white  text-sm font-medium hover:bg-warning-600 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Close Selected ({selectedPolls.size})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedPolls.size === filteredPolls.length && filteredPolls.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Poll Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Votes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Likes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredPolls.map((poll) => (
              <tr key={poll.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedPolls.has(poll.id)}
                    onChange={() => toggleSelect(poll.id)}
                    className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-xs">
                    {poll.title}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{poll.author}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    poll.status === "active"
                      ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400"
                      : "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
                  }`}>
                    {poll.status === "active" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {poll.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">{poll.votes.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{poll.likes.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{poll.createdAt}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(poll.id)}
                      disabled={isDeleting === poll.id}
                      className="p-2 text-neutral-400 hover:text-error-600 dark:hover:text-error-400 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeleting === poll.id ? (
                        <div className="h-4 w-4 animate-spin border-2 border-error-500 border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredPolls.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">No polls found matching your criteria</p>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing {filteredPolls.length} of {polls.length} polls
        </p>
      </div>
    </div>
  );
}
