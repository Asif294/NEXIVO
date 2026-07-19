// Lightweight fetch client for the Nexivo API.
//
// - All requests go to same-origin `/api/*` (proxied to Django by next.config).
// - `credentials: "include"` so the HttpOnly `refresh_token` cookie flows.
// - The short-lived access token is kept in memory only (never localStorage).
// - On a 401 it transparently tries the refresh endpoint once, then retries.

const REFRESH_PATH = "/api/account/token/refresh/";

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(extractMessage(data) ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/** Pull a human-friendly message out of a DRF error payload. */
function extractMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return typeof data === "string" ? data : null;
  }
  const obj = data as Record<string, unknown>;
  // Common single-message keys used by the backend.
  for (const key of ["detail", "error", "success"]) {
    if (typeof obj[key] === "string") return obj[key] as string;
  }
  // Otherwise surface the first field error (e.g. {"username": ["taken"]}).
  const first = Object.entries(obj)[0];
  if (first) {
    const [field, value] = first;
    const text = Array.isArray(value) ? value.join(" ") : String(value);
    return field === "non_field_errors" ? text : `${field}: ${text}`;
  }
  return null;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** POST the refresh endpoint using the cookie. Returns the new access token or null. */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(REFRESH_PATH, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await parseBody(res)) as { access?: string } | null;
    if (data?.access) {
      accessToken = data.access;
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Internal flag to avoid infinite refresh/retry loops. */
  _retried?: boolean;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, _retried, headers: extraHeaders, ...rest } = options;

  const headers = new Headers(extraHeaders);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(path, {
    ...rest,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // Access token expired: refresh once, then replay the original request.
  if (res.status === 401 && !_retried && path !== REFRESH_PATH) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
  }

  const data = await parseBody(res);
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as T;
}
