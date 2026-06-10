import { apiClient } from './apiClient';

export type LogoutResponse = {
  userId: number;
};

export function logoutAuth() {
  return apiClient.post<LogoutResponse>('/auth/logout', undefined, {
    auth: true,
  });
}