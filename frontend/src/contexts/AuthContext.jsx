'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, users, getTokens, clearTokens } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored tokens on mount
  useEffect(() => {
    const { access, refresh } = getTokens();
    if (!access && !refresh) {
      setLoading(false);
      return;
    }
    users.me()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    await auth.login(email, password);
    const profile = await users.me();
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);

  // Call after profile update to sync local state
  const refreshUser = useCallback(async () => {
    const profile = await users.me();
    setUser(profile);
    return profile;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
