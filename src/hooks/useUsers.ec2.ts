/**
 * EC2-only useUsers hook.
 * Calls /api/users on your self-hosted backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ec2Fetch, getAccessToken } from "@/lib/ec2/client";
import { User } from "@/types/user";

export const useUsers = () => {
  const { data, isLoading, error, refetch } = useQuery<User[], Error>({
    queryKey: ["ec2", "users"],
    queryFn: async () => {
      const res = await ec2Fetch<User[]>("/api/users");
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
    enabled: !!getAccessToken(),
  });

  return {
    users: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Partial<User> & { password: string }) => {
      const res = await ec2Fetch<User>("/api/users", {
        method: "POST",
        body: JSON.stringify(user),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<User> & { id: string }) => {
      const res = await ec2Fetch<User>(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await ec2Fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.error) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "users"] });
    },
  });
};
