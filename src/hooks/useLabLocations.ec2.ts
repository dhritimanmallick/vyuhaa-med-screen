/**
 * EC2-only useLabLocations hook.
 * Calls /api/lab-locations on your self-hosted backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ec2Fetch, getAccessToken } from "@/lib/ec2/client";

interface LabLocation {
  id: string;
  name: string;
  address?: string;
  contact_info?: Record<string, unknown>;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useLabLocations = () => {
  const { data, isLoading, error, refetch } = useQuery<LabLocation[], Error>({
    queryKey: ["ec2", "lab-locations"],
    queryFn: async () => {
      const res = await ec2Fetch<LabLocation[]>("/api/lab-locations");
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
    enabled: !!getAccessToken(),
  });

  return {
    labLocations: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export const useCreateLabLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Partial<LabLocation>) => {
      const res = await ec2Fetch<LabLocation>("/api/lab-locations", {
        method: "POST",
        body: JSON.stringify(location),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "lab-locations"] });
    },
  });
};

export const useUpdateLabLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LabLocation> & { id: string }) => {
      const res = await ec2Fetch<LabLocation>(`/api/lab-locations/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "lab-locations"] });
    },
  });
};

export const useDeleteLabLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await ec2Fetch(`/api/lab-locations/${id}`, { method: "DELETE" });
      if (res.error) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "lab-locations"] });
    },
  });
};
