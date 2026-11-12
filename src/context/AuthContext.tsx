import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../services/auth';

// Remembers who is signed in, so the app stays signed in after it is closed or reloaded.
// Later the real app will also keep the login tokens here, in secure storage.
const STORAGE_KEY = 'amal.user';

type AuthState = {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) setUser(JSON.parse(value));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      signIn: (u) => {
        setUser(u);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u)).catch(() => {});
      },
      signOut: () => {
        setUser(null);
        AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      },
    }),
    [user],
  );

  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
