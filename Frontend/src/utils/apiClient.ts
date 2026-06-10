import {
  endAuthSession,
  getAuthAccessToken,
  getAuthRefreshToken,
  updateAuthTokens,
} from './authSession';

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

type TokenReissueResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenExpiresIn: number | null;
};

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

async function parseResponse<T>(response: Response): Promise<ApiResponse<T> | null> {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return null;
  }

  return response.json() as Promise<ApiResponse<T>>;
}

async function requestTokenReissue() {
  const refreshToken = getAuthRefreshToken();

  if (!refreshToken) {
    endAuthSession();
    return null;
  }

  const response = await fetch(buildApiUrl('/auth/token/reissue'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  const parsedResponse = await parseResponse<TokenReissueResponse>(response);

  if (!response.ok || !parsedResponse || !parsedResponse.success) {
    endAuthSession();
    return null;
  }

  const nextTokens = {
    accessToken: parsedResponse.data.accessToken,
    refreshToken: parsedResponse.data.refreshToken,
  };

  updateAuthTokens(nextTokens);

  return nextTokens;
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
    headers: requestHeaders,
    body: requestBody,
  });

  const parsedResponse = await parseResponse<T>(response);

  if (response.status === 401 && auth && !retried) {
    const nextTokens = await requestTokenReissue();

    if (nextTokens) {
      return executeRequest<T>(path, options, true);
    }
  }

  if (!response.ok) {
    throw new ApiClientError(
      parsedResponse?.message ?? '요청 처리 중 오류가 발생했습니다.',
      response.status,
      parsedResponse && !parsedResponse.success ? parsedResponse.error?.code : undefined,
      parsedResponse && !parsedResponse.success ? parsedResponse.error?.detail : undefined,
    );
  }

  if (!parsedResponse) {
    return undefined as T;
  }

  if (!parsedResponse.success) {
    throw new ApiClientError(
      parsedResponse.message,
      response.status,
      parsedResponse.error?.code,
      parsedResponse.error?.detail,
    );
  }

  return parsedResponse.data;
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