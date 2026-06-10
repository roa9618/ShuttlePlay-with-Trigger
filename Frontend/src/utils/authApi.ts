import { apiClient } from './apiClient';

export type LogoutResponse = {
  userId: number;
};

export type CheckEmailResponse = {
  available: boolean;
};

export type EmailVerificationSendResponse = {
  email: string;
  expiresInMinutes: number;
};

export type EmailVerificationConfirmResponse = {
  email: string;
  verified: boolean;
};

export function logoutAuth() {
  return apiClient.post<LogoutResponse>('/auth/logout', undefined, {
    auth: true,
  });
}

export function checkEmailAvailability(email: string) {
  return apiClient.post<CheckEmailResponse>('/auth/check-email', {
    email,
  });
}

export function sendEmailVerification(email: string) {
  return apiClient.post<EmailVerificationSendResponse>('/auth/email-verification/send', {
    email,
  });
}

export function confirmEmailVerification(email: string, code: string) {
  return apiClient.post<EmailVerificationConfirmResponse>('/auth/email-verification/confirm', {
    email,
    code,
  });
}