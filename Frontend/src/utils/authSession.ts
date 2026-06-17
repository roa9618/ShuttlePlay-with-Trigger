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
};

const AUTH_SESSION_KEY = 'shuttleplay-auth-session';
const AUTH_TOKENS_KEY = 'shuttleplay-auth-tokens';
const AUTH_REDIRECT_PATH_KEY = 'shuttleplay-auth-redirect-path';
const AUTH_CHANNEL_NAME = 'shuttleplay-auth-channel';

let memorySession: AuthSession | null = null;
let memoryAccessToken: string | null = null;
let authChannel: BroadcastChannel | null = null;

export type AuthBroadcastEventType = 'LOGIN' | 'LOGOUT' | 'USER_UPDATED';

function getAuthChannel() {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  if (!authChannel) {
    authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
  }

  return authChannel;
}

function removeLegacyStoredAuth() {
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(AUTH_TOKENS_KEY);
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_TOKENS_KEY);
}

export function normalizeAuthRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith('/')) {
    return '/';
  }

  if (path.startsWith('//') || path.startsWith('/\\')) {
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
  return memorySession;
}

export function getAuthTokens(): AuthTokens | null {
  if (!memoryAccessToken) {
    return null;
  }

  return {
    accessToken: memoryAccessToken,
  };
}

export function getAuthAccessToken() {
  return memoryAccessToken;
}

export function isAuthenticated() {
  return memorySession !== null && memoryAccessToken !== null;
}

export function hasRole(role: UserRole) {
  return memorySession?.role === role;
}

export function startAuthSession(session: AuthSession, remember = false, tokens: AuthTokens | null = null) {
  void remember;
  removeLegacyStoredAuth();
  memorySession = session;
  memoryAccessToken = tokens?.accessToken ?? memoryAccessToken;
}

export function startTokenAuthSession(session: AuthSession, tokens: AuthTokens, remember = false) {
  void remember;
  removeLegacyStoredAuth();
  memorySession = session;
  memoryAccessToken = tokens.accessToken;
}

export function updateAuthTokens(tokens: AuthTokens) {
  removeLegacyStoredAuth();
  memoryAccessToken = tokens.accessToken;
}

export function updateAuthSession(session: AuthSession) {
  removeLegacyStoredAuth();
  memorySession = session;
}

export function setAuthRedirectPath(path: string | null | undefined) {
  window.sessionStorage.setItem(AUTH_REDIRECT_PATH_KEY, normalizeAuthRedirectPath(path));
}

export function getAuthRedirectPath() {
  return normalizeAuthRedirectPath(window.sessionStorage.getItem(AUTH_REDIRECT_PATH_KEY));
}

export function consumeAuthRedirectPath() {
  const redirectPath = getAuthRedirectPath();

  window.sessionStorage.removeItem(AUTH_REDIRECT_PATH_KEY);

  return redirectPath;
}

export function endAuthSession() {
  memorySession = null;
  memoryAccessToken = null;
  window.sessionStorage.removeItem(AUTH_REDIRECT_PATH_KEY);
  removeLegacyStoredAuth();
}

export function broadcastAuthLogin() {
  getAuthChannel()?.postMessage({ type: 'LOGIN' });
}

export function broadcastAuthLogout() {
  getAuthChannel()?.postMessage({ type: 'LOGOUT' });
}

export function broadcastAuthUserUpdated() {
  getAuthChannel()?.postMessage({ type: 'USER_UPDATED' });
}

export function subscribeAuthBroadcast(listener: (eventType: AuthBroadcastEventType) => void) {
  const channel = getAuthChannel();

  if (!channel) {
    return () => undefined;
  }

  const handleMessage = (event: MessageEvent) => {
    if (
      event.data?.type === 'LOGIN'
      || event.data?.type === 'LOGOUT'
      || event.data?.type === 'USER_UPDATED'
    ) {
      listener(event.data.type);
    }
  };

  channel.addEventListener('message', handleMessage);

  return () => {
    channel.removeEventListener('message', handleMessage);
  };
}
