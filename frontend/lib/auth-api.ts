import { apiGet, apiPost } from "./api-client";
import { AuthUser } from "./types";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user_id: number;
  username: string;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const result = await apiPost<{ id: number; username: string }>(
    "/auth/register",
    payload,
  );

  return {
    userId: result.id,
    username: result.username,
  };
}

export async function loginUser(
  username: string,
  password: string,
): Promise<AuthUser> {
  const result = await apiPost<LoginResponse>("/auth/login", {
    username,
    password,
  });

  return {
    userId: result.user_id,
    username: result.username,
  };
}

export async function fetchCurrentUser(userId: number): Promise<AuthUser> {
  const result = await apiGet<{ id: number; username: string }>(
    `/auth/me/${userId}`,
  );

  return {
    userId: result.id,
    username: result.username,
  };
}
