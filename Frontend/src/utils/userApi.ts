import { apiClient } from './apiClient';
import type { UserRole } from './authSession';

export type CurrentUserResponse = {
  id: number;
  email: string;
  name: string;
  gender: string | null;
  ageGroup: string | null;
  grade: string | null;
  doublesMmr: number;
  mixedMmr: number;
  role: UserRole;
  status: string;
  provider: string;
  profileImageUrl: string | null;
  profileCompleted: boolean;
};

export function getCurrentUser() {
  return apiClient.get<CurrentUserResponse>('/users/me', {
    auth: true,
  });
}