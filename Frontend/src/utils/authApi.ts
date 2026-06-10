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

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  gender: string;
  ageGroup: string;
  grade: string;
  agreementAccepted: boolean;
};

export type RegisterResponse = {
  id?: number;
  userId?: number;
  email: string;
  name: string;
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

export function registerAuth(request: RegisterRequest) {
  return apiClient.post<RegisterResponse>('/auth/register', request);
}