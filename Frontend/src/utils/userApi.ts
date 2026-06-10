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

export type ProfileCompletionResponse = {
  name: string | null;
  gender: string | null;
  ageGroup: string | null;
  grade: string | null;
  agreementAccepted: boolean;
  profileCompleted: boolean;
};

export type ProfileCompletionRequest = {
  name: string;
  gender: string;
  ageGroup: string;
  grade: string;
  agreementAccepted: boolean;
};

export function getCurrentUser() {
  return apiClient.get<CurrentUserResponse>('/users/me', {
    auth: true,
  });
}

export function getProfileCompletion() {
  return apiClient.get<ProfileCompletionResponse>('/users/me/profile-completion', {
    auth: true,
  });
}

export function updateProfileCompletion(request: ProfileCompletionRequest) {
  return apiClient.patch<ProfileCompletionResponse>('/users/me/profile-completion', request, {
    auth: true,
  });
}