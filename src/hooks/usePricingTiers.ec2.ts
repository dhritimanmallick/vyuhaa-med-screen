/**
 * EC2-only usePricingTiers hook.
 * Calls /api/pricing on your self-hosted backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ec2Fetch, getAccessToken } from "@/lib/ec2/client";
import { PricingTier } from "@/types/user";

export const usePricingTiers = () => {
  const { data, isLoading, error, refetch } = useQuery<PricingTier[], Error>({
    queryKey: ["ec2", "pricing"],
    queryFn: async () => {
      const res = await ec2Fetch<PricingTier[]>("/api/pricing");
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
    enabled: !!getAccessToken(),
  });

  return {
    pricingTiers: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export const useUpdatePricingTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PricingTier> & { id: string }) => {
      const res = await ec2Fetch<PricingTier>(`/api/pricing/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "pricing"] });
    },
  });
};
