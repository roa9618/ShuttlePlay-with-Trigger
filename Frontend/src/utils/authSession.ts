export type UserRole = 'USER' | 'ADMIN';

export type AuthSession = {
  email: string;
  name: string;
  role: UserRole;
};

type MockAccount = AuthSession & {
  password: string;
};

const AUTH_SESSION_KEY = 'shuttleplay-auth-session';

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: 'user@shuttleplay.kr',
    password: 'User1234',
    name: '일반 회원',
    role: 'USER',
  },
  {
    email: 'admin@shuttleplay.kr',
    password: 'Admin1234',
    name: '운영 관리자',
    role: 'ADMIN',
  },
];

export function authenticateMockAccount(email: string, password: string) {
  return MOCK_ACCOUNTS.find((account) => (
    account.email === email.toLowerCase() && account.password === password
  )) ?? null;
}

function parseStoredSession(storedSession: string | null, storage: Storage): AuthSession | null {
  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    storage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  const sessionStorageSession = parseStoredSession(
    window.sessionStorage.getItem(AUTH_SESSION_KEY),
    window.sessionStorage,
  );

  if (sessionStorageSession) {
    return sessionStorageSession;
  }

  return parseStoredSession(
    window.localStorage.getItem(AUTH_SESSION_KEY),
    window.localStorage,
  );
}

export function isAuthenticated() {
  return getAuthSession() !== null;
}

export function hasRole(role: UserRole) {
  return getAuthSession()?.role === role;
}

export function startAuthSession(account: MockAccount, remember = false) {
  const session: AuthSession = {
    email: account.email,
    name: account.name,
    role: account.role,
  };

  const storage = remember ? window.localStorage : window.sessionStorage;
  const unusedStorage = remember ? window.sessionStorage : window.localStorage;

  unusedStorage.removeItem(AUTH_SESSION_KEY);
  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function endAuthSession() {
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}
