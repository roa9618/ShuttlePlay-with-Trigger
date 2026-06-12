export type UserRole = 'USER' | 'ADMIN';

export type AuthSession = {
  id?: number;
  email: string;
  name: string;
  role: UserRole;
  provider?: string;
  profileCompleted?: boolean;
  gender?: string | null;
  ageGroup?: string | null;
  grade?: string | null;
  profileImageUrl?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const AUTH_SESSION_KEY = 'shuttleplay-auth-session';
const AUTH_TOKENS_KEY = 'shuttleplay-auth-tokens';
const AUTH_REDIRECT_PATH_KEY = 'shuttleplay-auth-redirect-path';

function parseStoredValue<T>(storedValue: string | null, storage: Storage, key: string): T | null {
  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

function getStoredValue<T>(key: string): T | null {
  const sessionStorageValue = parseStoredValue<T>(
    window.sessionStorage.getItem(key),
    window.sessionStorage,
    key,
  );

  if (sessionStorageValue) {
    return sessionStorageValue;
  }

  return parseStoredValue<T>(
    window.localStorage.getItem(key),
    window.localStorage,
    key,
  );
}

function getActiveStorage() {
  if (window.sessionStorage.getItem(AUTH_SESSION_KEY)) {
    return window.sessionStorage;
  }

  if (window.localStorage.getItem(AUTH_SESSION_KEY)) {
    return window.localStorage;
  }

  if (window.sessionStorage.getItem(AUTH_TOKENS_KEY)) {
    return window.sessionStorage;
  }

  if (window.localStorage.getItem(AUTH_TOKENS_KEY)) {
    return window.localStorage;
  }

  return window.sessionStorage;
}

function getInactiveStorage(storage: Storage) {
  return storage === window.localStorage ? window.sessionStorage : window.localStorage;
}

function persistSession(session: AuthSession, tokens: AuthTokens | null, remember = false) {
  const storage = remember ? window.localStorage : window.sessionStorage;
  const inactiveStorage = getInactiveStorage(storage);

  inactiveStorage.removeItem(AUTH_SESSION_KEY);
  inactiveStorage.removeItem(AUTH_TOKENS_KEY);

  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

  if (tokens) {
    storage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  } else {
    storage.removeItem(AUTH_TOKENS_KEY);
  }
}

function normalizeRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith('/')) {
    return '/';
  }

  if (
    path.startsWith('/login')
    || path.startsWith('/signup')
    || path.startsWith('/social-signup')
    || path.startsWith('/password-reset')
  ) {
    return '/';
  }

  return path;
}

export function getAuthSession(): AuthSession | null {
  return getStoredValue<AuthSession>(AUTH_SESSION_KEY);
}

export function getAuthTokens(): AuthTokens | null {
  return getStoredValue<AuthTokens>(AUTH_TOKENS_KEY);
}

export function getAuthAccessToken() {
  return getAuthTokens()?.accessToken ?? null;
}

export function getAuthRefreshToken() {
  return getAuthTokens()?.refreshToken ?? null;
}

export function isAuthenticated() {
  return getAuthSession() !== null;
}

export function hasRole(role: UserRole) {
  return getAuthSession()?.role === role;
}

export function startAuthSession(session: AuthSession, remember = false, tokens: AuthTokens | null = null) {
  persistSession(session, tokens, remember);
}

export function startTokenAuthSession(session: AuthSession, tokens: AuthTokens, remember = false) {
  persistSession(session, tokens, remember);
}

export function updateAuthTokens(tokens: AuthTokens) {
  const storage = getActiveStorage();

  storage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  getInactiveStorage(storage).removeItem(AUTH_TOKENS_KEY);
}

export function updateAuthSession(session: AuthSession) {
  const storage = getActiveStorage();
  const currentTokens = getAuthTokens();

  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

  if (currentTokens) {
    storage.setItem(AUTH_TOKENS_KEY, JSON.stringify(currentTokens));
  }

  getInactiveStorage(storage).removeItem(AUTH_SESSION_KEY);
  getInactiveStorage(storage).removeItem(AUTH_TOKENS_KEY);
}

export function setAuthRedirectPath(path: string | null | undefined) {
  window.sessionStorage.setItem(AUTH_REDIRECT_PATH_KEY, normalizeRedirectPath(path));
}

export function getAuthRedirectPath() {
  return normalizeRedirectPath(window.sessionStorage.getItem(AUTH_REDIRECT_PATH_KEY));
}

export function consumeAuthRedirectPath() {
  const redirectPath = getAuthRedirectPath();

  window.sessionStorage.removeItem(AUTH_REDIRECT_PATH_KEY);

  return redirectPath;
}

export function endAuthSession() {
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(AUTH_TOKENS_KEY);
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_TOKENS_KEY);
}
