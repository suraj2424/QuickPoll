export interface PollOption {
  id: number;
  text: string;
  poll_id: number;
  created_at: string;
  vote_count: number;
}

export interface Poll {
  id: number;
  title: string;
  description?: string | null;
  creator_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  closes_at?: string | null;
  options: PollOption[];
  total_votes: number;
  total_likes: number;
  user_voted?: boolean;
  user_liked?: boolean;
}

export interface PollCreatePayload {
  title: string;
  description?: string;
  options: string[];
  duration_minutes?: number | null;
  closes_at?: string;
}

export interface VoteResponse {
  id: number;
  user_id: number;
  poll_id: number;
  option_id: number;
  created_at: string;
}

export interface LikeResponse {
  id: number;
  user_id: number;
  poll_id: number;
  created_at: string;
}

export interface AuthUser {
  userId: number;
  username: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}
