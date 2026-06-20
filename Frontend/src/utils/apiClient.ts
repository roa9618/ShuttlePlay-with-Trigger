import {
  endAuthSession,
  updateAuthSession,
  updateAuthTokens,
} from './authSession';
import { getAuthAccessToken } from './authSession';
import type { AuthSession, UserRole } from './authSession';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api').replace(/\/$/, '');
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  error?: {
    code?: string;
    detail?: string;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

type LoginUserResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  provider: string;
  profileCompleted: boolean;
  gender: string | null;
  ageGroup: string | null;
  grade: string | null;
  profileImageUrl: string | null;
};

type TokenReissueResponse = {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
  refreshTokenExpiresIn?: number | null;
  user: LoginUserResponse;
};

let tokenReissuePromise: Promise<{ accessToken: string } | null> | null = null;

export class ApiClientError extends Error {
  status: number;
  code?: string;
  detail?: string;

  constructor(message: string, status: number, code?: string, detail?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWrappedApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return isObject(value) && typeof value.success === 'boolean';
}

function toAuthSession(user: LoginUserResponse): AuthSession {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    provider: user.provider,
    profileCompleted: user.profileCompleted,
    gender: user.gender,
    ageGroup: user.ageGroup,
    grade: user.grade,
    profileImageUrl: user.profileImageUrl,
  };
}

async function parseJsonResponse(response: Response): Promise<unknown | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function unwrapResponseData<T>(parsedResponse: unknown, status: number): T {
  if (!isWrappedApiResponse<T>(parsedResponse)) {
    return parsedResponse as T;
  }

  if (!parsedResponse.success) {
    throw new ApiClientError(
      parsedResponse.message,
      status,
      parsedResponse.error?.code,
      parsedResponse.error?.detail,
    );
  }

  return parsedResponse.data;
}

async function performTokenReissue() {
  const response = await fetch(buildApiUrl('/auth/session'), {
    method: 'POST',
    credentials: 'include',
  });

  const parsedResponse = await parseJsonResponse(response);

  if (!response.ok) {
    endAuthSession();
    return null;
  }

  const reissueData = unwrapResponseData<TokenReissueResponse>(parsedResponse, response.status);

  if (!reissueData?.accessToken || !reissueData?.user) {
    endAuthSession();
    return null;
  }

  const nextTokens = {
    accessToken: reissueData.accessToken,
  };
  const nextSession = toAuthSession(reissueData.user);

  updateAuthTokens(nextTokens);
  updateAuthSession(nextSession);

  return nextTokens;
}

async function requestTokenReissue() {
  if (!tokenReissuePromise) {
    tokenReissuePromise = performTokenReissue()
      .finally(() => {
        tokenReissuePromise = null;
      });
  }

  return tokenReissuePromise;
}

async function executeRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  retried = false,
): Promise<T> {
  const { body, auth = false, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  if (auth) {
    const accessToken = getAuthAccessToken();

    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  let requestBody: BodyInit | undefined;

  if (isFormData(body)) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildApiUrl(path), {
    ...requestOptions,
    credentials: 'include',
    headers: requestHeaders,
    body: requestBody,
  });

  const parsedResponse = await parseJsonResponse(response);

  if (response.status === 401 && auth && !retried) {
    const nextTokens = await requestTokenReissue();

    if (nextTokens) {
      return executeRequest<T>(path, options, true);
    }
  }

  if (!response.ok) {
    if (isWrappedApiResponse<T>(parsedResponse) && !parsedResponse.success) {
      throw new ApiClientError(
        parsedResponse.message,
        response.status,
        parsedResponse.error?.code,
        parsedResponse.error?.detail,
      );
    }

    throw new ApiClientError('요청 처리 중 오류가 발생했습니다.', response.status);
  }

  if (parsedResponse === null) {
    return undefined as T;
  }

  return unwrapResponseData<T>(parsedResponse, response.status);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return executeRequest<T>(path, options);
}

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) => apiRequest<T>(path, {
    ...options,
    method: 'GET',
  }),

  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) => apiRequest<T>(path, {
    ...options,
    method: 'POST',
    body,
  }),

  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) => apiRequest<T>(path, {
    ...options,
    method: 'PATCH',
    body,
  }),

  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) => apiRequest<T>(path, {
    ...options,
    method: 'PUT',
    body,
  }),

  delete: <T>(path: string, options?: ApiRequestOptions) => apiRequest<T>(path, {
    ...options,
    method: 'DELETE',
  }),
};
