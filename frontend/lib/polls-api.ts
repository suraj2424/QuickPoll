import { apiGet, apiPost } from "./api-client";
import {
  Poll,
  PollCreatePayload,
  VoteResponse,
  LikeResponse,
} from "./types";

export async function fetchPolls(userId?: number): Promise<Poll[]> {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  return apiGet<Poll[]>(`/polls/${query}`);
}

export async function fetchPoll(pollId: number, userId?: number): Promise<Poll> {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  return apiGet<Poll>(`/polls/${pollId}${query}`);
}

export async function createPoll(
  payload: PollCreatePayload,
  creatorId: number,
): Promise<Poll> {
  const query = `?creator_id=${encodeURIComponent(creatorId)}`;
  return apiPost<Poll>(`/polls/${query}`, payload);
}

export async function castVote(
  pollId: number,
  optionId: number,
  userId: number,
): Promise<VoteResponse> {
  const query = `?user_id=${encodeURIComponent(userId)}`;
  return apiPost<VoteResponse>(`/votes/${query}`, {
    poll_id: pollId,
    option_id: optionId,
  });
}

export async function toggleLike(
  pollId: number,
  userId: number,
): Promise<LikeResponse | { message: string; liked: boolean } | { message: string }> {
  const query = `?user_id=${encodeURIComponent(userId)}`;
  return apiPost<LikeResponse | { message: string; liked: boolean } | { message: string }>(
    `/likes/${query}`,
    {
      poll_id: pollId,
    },
  );
}

export async function closePollRequest(pollId: number, userId: number): Promise<Poll> {
  const query = `?user_id=${encodeURIComponent(userId)}`;
  return apiPost<Poll>(`/polls/${pollId}/close${query}`);
}
