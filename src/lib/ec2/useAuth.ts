/**
 * useAuth hook for EC2 self-hosted backend (no Supabase).
 * Reads JWT from localStorage, provides login/logout, and exposes user.
 */

import { useState, useEffect, useCallback } from "react";
import {
  EC2User,
  getAccessToken,
  getStoredUser,
  ec2Login,
  ec2Logout,
  ec2RefreshToken,
  clearAuthData,
} from "./client";

export interface UseAuthReturn {
  user: EC2User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<EC2User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Attempt to refresh to validate token
      const refreshed = await ec2RefreshToken();
      if (refreshed) {
        setUser(getStoredUser());
      } else {
        clearAuthData();
      }
      setLoading(false);
    };

    init();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await ec2Login(email, password);
    if (res.error) {
      throw new Error(res.error);
    }
    setUser(res.data?.user ?? null);
  }, []);

  const signOut = useCallback(async () => {
    await ec2Logout();
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, loading, signIn, signOut };
};
