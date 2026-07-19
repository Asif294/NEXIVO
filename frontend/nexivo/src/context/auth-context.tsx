"use client";

// Global auth state: holds the current user and exposes login/register/logout.
// Wrap the app in <AuthProvider>; read it anywhere via the useAuth() hook.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as authService from "@/lib/auth-service";
import type {
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth.types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (
    payload: RegisterPayload,
  ) => Promise<{ success: string; email: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // On mount, try to restore the session from the refresh cookie.
  useEffect(() => {
    let active = true;
    authService
      .bootstrapSession()
      .then((restored) => {
        if (!active) return;
        setUser(restored);
        setStatus(restored ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedIn = await authService.login(payload);
    setUser(loggedIn);
    setStatus("authenticated");
    return loggedIn;
  }, []);

  const register = useCallback(
    (payload: RegisterPayload) => authService.register(payload),
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
