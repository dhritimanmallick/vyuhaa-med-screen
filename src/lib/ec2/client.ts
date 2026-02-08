/**
 * EC2 Backend API Client
 * ----------------------
 * All requests use relative URLs (e.g., /api/...) which nginx proxies to the backend.
 * JWT token is stored in localStorage as `vyuhaa_access_token`.
 */

const ACCESS_TOKEN_KEY = "vyuhaa_access_token";
const REFRESH_TOKEN_KEY = "vyuhaa_refresh_token";
const USER_KEY = "vyuhaa_user";

export interface EC2User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "accession" | "technician" | "pathologist" | "customer";
  lab_location?: string;
}

/* ------------------------------------------------------------------ */
/* Token helpers                                                       */
/* ------------------------------------------------------------------ */

export const getAccessToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const getRefreshToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

export const getStoredUser = (): EC2User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const saveAuthData = (
  accessToken: string,
  refreshToken: string,
  user: EC2User
) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/* ------------------------------------------------------------------ */
/* Fetch wrapper                                                       */
/* ------------------------------------------------------------------ */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export async function ec2Fetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type if body is present and not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(path, { ...options, headers });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { data: null, error: errBody.error || `Request failed (${res.status})` };
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return { data: null, error: null };
    }

    const json = await res.json();
    return { data: json as T, error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err.message : "Network error" };
  }
}

/* ------------------------------------------------------------------ */
/* Auth endpoints                                                      */
/* ------------------------------------------------------------------ */

export async function ec2Login(
  email: string,
  password: string
): Promise<ApiResponse<{ user: EC2User; access_token: string; refresh_token: string }>> {
  const res = await ec2Fetch<{ user: EC2User; access_token: string; refresh_token: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  if (res.data) {
    saveAuthData(res.data.access_token, res.data.refresh_token, res.data.user);
  }

  return res;
}

export async function ec2Logout(): Promise<void> {
  clearAuthData();
}

export async function ec2RefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const res = await ec2Fetch<{ access_token: string; user: EC2User }>(
    "/api/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }
  );

  if (res.data) {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    return true;
  }

  clearAuthData();
  return false;
}
