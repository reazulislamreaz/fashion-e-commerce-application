'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getMeApi,
  loginApi,
  logoutApi,
  refreshApi,
  registerApi,
} from '@/lib/api/services';
import { dispatchSessionExpired } from '@/components/ui/session-expired-modal';
import { setAuthInterceptor } from '@/lib/api/client';
import { AuthResult, RegisterResult, User } from '@/types';

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'ef_access_token';
const REFRESH_TOKEN_KEY = 'ef_refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRefreshingRef = useRef(false);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearAuthState();
    dispatchSessionExpired();
  }, [clearAuthState]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefresh) {
      clearAuthState();
      return false;
    }

    try {
      const authRes = await refreshApi(storedRefresh);
      setUser(authRes.user);
      setAccessToken(authRes.accessToken);
      setRefreshToken(authRes.refreshToken);
      localStorage.setItem(ACCESS_TOKEN_KEY, authRes.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, authRes.refreshToken);
      return true;
    } catch {
      clearAuthState();
      return false;
    }
  }, [clearAuthState]);

  useEffect(() => {
    async function initAuth() {
      if (typeof window === 'undefined') return;

      const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
      const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (storedAccess) {
        try {
          const profile = await getMeApi(storedAccess);
          setUser(profile);
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
        } catch {
          // Access token might be expired, attempt refresh
          if (storedRefresh) {
            await refreshSession();
          } else {
            clearAuthState();
          }
        }
      } else if (storedRefresh) {
        await refreshSession();
      }
      setIsLoading(false);
    }

    initAuth();
  }, [clearAuthState, refreshSession]);

  // Register the 401 interceptor so the API client can auto-refresh or
  // trigger the session-expired modal when the access token is invalid.
  useEffect(() => {
    setAuthInterceptor(async () => {
      if (isRefreshingRef.current) return null;
      isRefreshingRef.current = true;

      try {
        const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!storedRefresh) {
          handleSessionExpired();
          return null;
        }

        const authRes = await refreshApi(storedRefresh);
        setUser(authRes.user);
        setAccessToken(authRes.accessToken);
        setRefreshToken(authRes.refreshToken);
        localStorage.setItem(ACCESS_TOKEN_KEY, authRes.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, authRes.refreshToken);
        return authRes.accessToken;
      } catch {
        handleSessionExpired();
        return null;
      } finally {
        isRefreshingRef.current = false;
      }
    });

    return () => setAuthInterceptor(null);
  }, [handleSessionExpired]);

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    setUser(res.user);
    setAccessToken(res.accessToken);
    setRefreshToken(res.refreshToken);

    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    const res = await registerApi(data);
    return res;
  };

  const logout = async () => {
    if (accessToken && refreshToken) {
      try {
        await logoutApi(accessToken, refreshToken);
      } catch {
        // Ignore network errors during local teardown
      }
    }
    clearAuthState();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
