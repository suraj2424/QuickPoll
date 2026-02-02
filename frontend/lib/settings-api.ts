import { apiGet, apiPut } from "./api-client";

interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

interface ProfileUpdatePayload {
  username: string;
  email?: string;
}

interface PreferencesPayload {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  pollNotifications: boolean;
}

export async function changePassword(
  userId: number,
  payload: PasswordChangePayload,
): Promise<void> {
  await apiPut<{ message: string }>(`/auth/users/${userId}/password`, payload);
}

export async function updateProfile(
  userId: number,
  payload: ProfileUpdatePayload,
): Promise<void> {
  await apiPut<{ message: string }>(`/auth/users/${userId}/profile`, payload);
}

export async function updatePreferences(
  userId: number,
  payload: PreferencesPayload,
): Promise<void> {
  await apiPut<{ message: string }>(`/auth/users/${userId}/preferences`, payload);
}

export async function fetchPreferences(
  userId: number,
): Promise<PreferencesPayload> {
  return await apiGet<PreferencesPayload>(`/auth/users/${userId}/preferences`);
}
