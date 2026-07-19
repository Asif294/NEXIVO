// Shapes mirror the Django `account` API (see backend/account).

export type UserRole = "customer" | "admin";

/** Matches UserSerializer on the backend. */
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: UserRole;
  is_admin: boolean;
  is_verified: boolean;
}

/** POST /api/account/login/ body. */
export interface LoginPayload {
  identifier: string; // username or phone number
  password: string;
}

/** POST /api/account/login/ 200 response. */
export interface LoginResponse {
  access: string;
  user: User;
}

/** POST /api/account/register/ body. */
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string; // YYYY-MM-DD
}

/** POST /api/account/token/refresh/ 200 response. */
export interface RefreshResponse {
  access: string;
}
