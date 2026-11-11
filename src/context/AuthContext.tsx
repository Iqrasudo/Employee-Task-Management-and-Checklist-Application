import React, { createContext, useContext, useMemo, useState } from 'react';
import type { AuthUser } from '../services/auth';

type AuthState = {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthState>(
    () => ({
      user,
      signIn: setUser,
      signOut: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
