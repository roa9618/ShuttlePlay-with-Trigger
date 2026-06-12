import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiClientError } from '../utils/apiClient';
import { logoutAuth } from '../utils/authApi';
import {
  endAuthSession,
  getAuthAccessToken,
  getAuthSession,
  updateAuthSession,
  type AuthSession,
} from '../utils/authSession';
import { getCurrentUser } from '../utils/userApi';

type AuthContextValue = {
  session: AuthSession | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<AuthSession | null>;
  setSessionFromStorage: () => AuthSession | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthSession(user: Awaited<ReturnType<typeof getCurrentUser>>): AuthSession {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const clearSession = useCallback(() => {
    endAuthSession();
    setSession(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const accessToken = getAuthAccessToken();

    if (!accessToken) {
      clearSession();
      return null;
    }

    try {
      setIsAuthLoading(true);

      const currentUser = await getCurrentUser();
      const nextSession = toAuthSession(currentUser);

      updateAuthSession(nextSession);
      setSession(nextSession);

      return nextSession;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        clearSession();
        return null;
      }

      const storedSession = getAuthSession();

      setSession(storedSession);
      return storedSession;
    } finally {
      setIsAuthLoading(false);
    }
  }, [clearSession]);

  const setSessionFromStorage = useCallback(() => {
    const storedSession = getAuthSession();

    setSession(storedSession);

    return storedSession;
  }, []);

  const logout = useCallback(() => {
    const accessToken = getAuthAccessToken();

    if (!accessToken) {
      clearSession();
      return;
    }

    void logoutAuth().finally(() => {
      clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    if (!getAuthAccessToken()) {
      setSession(null);
      return;
    }

    refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isAuthLoading,
    isAuthenticated: session !== null && getAuthAccessToken() !== null,
    refreshSession,
    setSessionFromStorage,
    logout,
  }), [session, isAuthLoading, refreshSession, setSessionFromStorage, logout]);

  return (
    <AuthContext.Provider value = {value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
