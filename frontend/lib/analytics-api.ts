import { apiGet } from "./api-client";

export interface VoteTrendItem {
  date: string;
  votes: number;
  polls: number;
}

export interface ActivityItem {
  id: string;
  type: "vote" | "like" | "share" | "created" | "follow";
  user_id: number;
  username: string;
  poll_id: number | null;
  poll_title: string | null;
  timestamp: string;
  metadata: string | null;
}

export interface EngagementMetrics {
  total_polls: number;
  active_polls: number;
  closed_polls: number;
  total_votes: number;
  total_likes: number;
  avg_votes_per_poll: number;
  avg_options_per_poll: number;
  participation_rate: number;
}

export interface PollEngagementItem {
  poll_id: number;
  title: string;
  votes: number;
  likes: number;
  engagement_rate: number;
  created_at: string;
}

export interface TopPollsResponse {
  polls: PollEngagementItem[];
}

export interface VoteTrendResponse {
  trends: VoteTrendItem[];
}

export interface ActivityFeedResponse {
  activities: ActivityItem[];
  total: number;
}

export interface AnalyticsDashboardResponse {
  metrics: EngagementMetrics;
  vote_trends: VoteTrendItem[];
  recent_activities: ActivityItem[];
}

export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboardResponse> {
  return apiGet<AnalyticsDashboardResponse>("/analytics/dashboard");
}

export async function fetchVoteTrends(days: number = 7): Promise<VoteTrendResponse> {
  return apiGet<VoteTrendResponse>(`/analytics/vote-trends?days=${days}`);
}

export async function fetchActivities(limit: number = 50, offset: number = 0): Promise<ActivityFeedResponse> {
  return apiGet<ActivityFeedResponse>(`/analytics/activities?limit=${limit}&offset=${offset}`);
}

export async function fetchEngagementMetrics(): Promise<EngagementMetrics> {
  return apiGet<EngagementMetrics>("/analytics/metrics");
}

export async function fetchTopPolls(): Promise<TopPollsResponse> {
  return apiGet<TopPollsResponse>("/analytics/top-polls");
}
