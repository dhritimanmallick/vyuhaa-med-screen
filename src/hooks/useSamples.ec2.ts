/**
 * EC2-only useSamples hook.
 * Calls /api/samples on your self-hosted backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ec2Fetch, getAccessToken } from "@/lib/ec2/client";
import { Sample } from "@/types/user";

export const useSamples = () => {
  const { data, isLoading, error, refetch } = useQuery<Sample[], Error>({
    queryKey: ["ec2", "samples"],
    queryFn: async () => {
      const res = await ec2Fetch<Sample[]>("/api/samples");
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
    enabled: !!getAccessToken(),
  });

  return {
    samples: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export const useUpdateSample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sample> & { id: string }) => {
      const res = await ec2Fetch<Sample>(`/api/samples/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "samples"] });
    },
  });
};

export const useCreateSample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sample: Partial<Sample>) => {
      const res = await ec2Fetch<Sample>("/api/samples", {
        method: "POST",
        body: JSON.stringify(sample),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "samples"] });
    },
  });
};

export const useDeleteSample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await ec2Fetch(`/api/samples/${id}`, { method: "DELETE" });
      if (res.error) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "samples"] });
    },
  });
};
