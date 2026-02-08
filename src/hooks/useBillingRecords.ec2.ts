/**
 * EC2-only useBillingRecords hook.
 * Calls /api/billing on your self-hosted backend.
 */

import { useQuery } from "@tanstack/react-query";
import { ec2Fetch, getAccessToken } from "@/lib/ec2/client";

interface BillingRecord {
  id: string;
  sample_id: string;
  customer_id: string;
  test_type: string;
  amount: number;
  billing_date: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export const useBillingRecords = () => {
  const { data, isLoading, error, refetch } = useQuery<BillingRecord[], Error>({
    queryKey: ["ec2", "billing"],
    queryFn: async () => {
      const res = await ec2Fetch<BillingRecord[]>("/api/billing");
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
    enabled: !!getAccessToken(),
  });

  return {
    billingRecords: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};
