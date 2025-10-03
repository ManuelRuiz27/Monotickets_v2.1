import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client.js';

type AuthContextValue = {
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'monotickets.accessToken';
const REFRESH_TOKEN_KEY = 'monotickets.refreshToken';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem(ACCESS_TOKEN_KEY)
  );

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(() => ({
    accessToken,
    login: async (email, password) => {
      const response = await apiClient.post('/auth/login', { email, password });
      setAccessToken(response.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    },
    logout: async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken && accessToken) {
        await apiClient.post(
          '/auth/logout',
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
      setAccessToken(null);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }), [accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export async function refreshToken() {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token || !accessToken) {
    return null;
  }
  const response = await apiClient.post(
    '/auth/refresh',
    { refreshToken: token },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
  return response.data;
}
