// Auth service: thin wrappers over the account API endpoints.
//
// Token strategy (see also lib/api.ts):
// - access token  -> kept in memory only (via setAccessToken).
// - refresh token -> HttpOnly `refresh_token` cookie, set/cleared by Django.
// - user profile   -> mirrored in localStorage so the UI can rehydrate on
//   reload (there is no `/me` endpoint). Profile data is non-sensitive.

import { apiFetch, refreshAccessToken, setAccessToken } from "@/lib/api";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
} from "@/types/auth.types";

const ACCOUNT = "/api/account";
const USER_STORAGE_KEY = "nexivo.user";

/** POST /api/account/register/ — creates the account. Returns the success message. */
export async function register(
  payload: RegisterPayload,
): Promise<{ success: string; email: string }> {
  return apiFetch(`${ACCOUNT}/register/`, {
    method: "POST",
    body: payload,
  });
}

/** POST /api/account/login/ — sets the access token + persists the user. */
export async function login(payload: LoginPayload): Promise<User> {
  const data = await apiFetch<LoginResponse>(`${ACCOUNT}/login/`, {
    method: "POST",
    body: payload,
  });
  setAccessToken(data.access);
  persistUser(data.user);
  return data.user;
}

/** POST /api/account/logout/ — blacklists the refresh token + clears local state. */
export async function logout(): Promise<void> {
  try {
    await apiFetch(`${ACCOUNT}/logout/`, { method: "POST" });
  } finally {
    // Always clear client state even if the network call failed.
    setAccessToken(null);
    clearPersistedUser();
  }
}

/**
 * Rehydrate a session on app start. Uses the refresh cookie to mint a fresh
 * access token; if that succeeds and we have a stored profile, the user is
 * still logged in. Returns the user or null.
 */
export async function bootstrapSession(): Promise<User | null> {
  const stored = readPersistedUser();
  if (!stored) return null;

  const token = await refreshAccessToken();
  if (!token) {
    clearPersistedUser();
    return null;
  }
  return stored;
}

// --- localStorage helpers (guarded for SSR) -------------------------------

function persistUser(user: User): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearPersistedUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

function readPersistedUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
