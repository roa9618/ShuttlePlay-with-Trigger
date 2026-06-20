/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApiClientError, apiClient } from '../utils/apiClient';
import { logoutAuth } from '../utils/authApi';
import {
  broadcastAuthLogout,
  endAuthSession,
  getAuthAccessToken,
  getAuthSession,
  startTokenAuthSession,
  subscribeAuthBroadcast,
  updateAuthSession,
  type AuthSession,
} from '../utils/authSession';
import { getCurrentUser } from '../utils/userApi';
import {
  clearSystemNotificationLoginRequest,
  disableSystemNotifications,
  requestSystemNotificationsAfterLogin,
} from '../utils/pushNotification';

type AuthContextValue = {
  session: AuthSession | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<AuthSession | null>;
  setSessionFromStorage: () => AuthSession | null;
  logout: () => void;
};

type AuthSessionResponse = {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    provider: string;
    profileCompleted: boolean;
    gender: string | null;
    ageGroup: string | null;
    grade: string | null;
    profileImageUrl: string | null;
  };
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

function toSessionFromAuthResponse(response: AuthSessionResponse): AuthSession {
  return {
    id: response.user.id,
    email: response.user.email,
    name: response.user.name,
    role: response.user.role,
    provider: response.user.provider,
    profileCompleted: response.user.profileCompleted,
    gender: response.user.gender,
    ageGroup: response.user.ageGroup,
    grade: response.user.grade,
    profileImageUrl: response.user.profileImageUrl,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const lastResumeRefreshAtRef = useRef(0);

  const clearSession = useCallback(() => {
    endAuthSession();
    setSession(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      if (!getAuthSession()) {
        setIsAuthLoading(true);
      }

      if (!getAuthAccessToken()) {
        const authSession = await apiClient.post<AuthSessionResponse>('/auth/session');
        const nextSession = toSessionFromAuthResponse(authSession);

        startTokenAuthSession(nextSession, {
          accessToken: authSession.accessToken,
        });
        setSession(nextSession);

        return nextSession;
      }

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

    const clearAfterLogout = () => {
      clearSystemNotificationLoginRequest();
      clearSession();
      broadcastAuthLogout();
    };

    if (!accessToken) {
      clearAfterLogout();
      return;
    }

    void disableSystemNotifications()
      .finally(() => logoutAuth())
      .finally(clearAfterLogout);
  }, [clearSession]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const resumeSession = () => {
      if (document.visibilityState !== 'visible' || !navigator.onLine) return;

      const now = Date.now();
      if (now - lastResumeRefreshAtRef.current < 1_000) return;
      lastResumeRefreshAtRef.current = now;

      void refreshSession();
    };

    document.addEventListener('visibilitychange', resumeSession);
    window.addEventListener('pageshow', resumeSession);
    window.addEventListener('focus', resumeSession);
    window.addEventListener('online', resumeSession);

    return () => {
      document.removeEventListener('visibilitychange', resumeSession);
      window.removeEventListener('pageshow', resumeSession);
      window.removeEventListener('focus', resumeSession);
      window.removeEventListener('online', resumeSession);
    };
  }, [refreshSession]);

  useEffect(() => {
    return subscribeAuthBroadcast((eventType) => {
      if (eventType === 'LOGOUT') {
        clearSystemNotificationLoginRequest();
        clearSession();
        return;
      }

      void refreshSession();
    });
  }, [clearSession, refreshSession]);

  useEffect(() => {
    if (session) {
      void requestSystemNotificationsAfterLogin();
    }
  }, [session]);

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
