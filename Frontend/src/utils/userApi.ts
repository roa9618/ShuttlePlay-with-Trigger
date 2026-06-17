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

export type UpdateUserProfileRequest = {
  name: string;
  gender: string;
  ageGroup: string;
  grade: string;
};

export type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export type UserNotificationSettingsResponse = {
  nextMatchEnabled: boolean;
  matchStartEnabled: boolean;
  courtChangeEnabled: boolean;
  resultRequestEnabled: boolean;
  scheduleChangeEnabled: boolean;
};

export type UserNotificationSettingsRequest = UserNotificationSettingsResponse;

export type UserImageUploadResponse = {
  imageUrl: string;
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

export function updateUserProfile(request: UpdateUserProfileRequest) {
  return apiClient.patch<CurrentUserResponse>('/users/me/profile', request, {
    auth: true,
  });
}

export function uploadUserProfileImage(image: File) {
  const formData = new FormData();
  formData.append('image', image);

  return apiClient.post<UserImageUploadResponse>('/users/me/profile-image', formData, {
    auth: true,
  });
}

export function deleteUserProfileImage() {
  return apiClient.delete<CurrentUserResponse>('/users/me/profile-image', {
    auth: true,
  });
}

export function updateUserPassword(request: UpdatePasswordRequest) {
  return apiClient.patch<void>('/users/me/password', request, {
    auth: true,
  });
}

export function getUserNotificationSettings() {
  return apiClient.get<UserNotificationSettingsResponse>('/users/me/notification-settings', {
    auth: true,
  });
}

export function updateUserNotificationSettings(request: UserNotificationSettingsRequest) {
  return apiClient.patch<UserNotificationSettingsResponse>('/users/me/notification-settings', request, {
    auth: true,
  });
}

export function deleteUserAccount() {
  return apiClient.delete<void>('/users/me', {
    auth: true,
  });
}
