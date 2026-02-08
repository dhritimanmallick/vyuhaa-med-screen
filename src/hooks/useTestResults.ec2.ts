/**
 * EC2-only useTestResults hook.
 * Calls /api/test-results on your self-hosted backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ec2Fetch, getAccessToken } from "@/lib/ec2/client";

interface TestResult {
  id: string;
  sample_id: string;
  patient_id?: string;
  test_findings?: string;
  diagnosis?: string;
  recommendations?: string;
  images_uploaded?: boolean;
  report_generated?: boolean;
  report_url?: string;
  report_sent_to?: string;
  report_sent_at?: string;
  reviewed_by?: string;
  completed_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const useTestResults = () => {
  const { data, isLoading, error, refetch } = useQuery<TestResult[], Error>({
    queryKey: ["ec2", "test-results"],
    queryFn: async () => {
      const res = await ec2Fetch<TestResult[]>("/api/test-results");
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
    enabled: !!getAccessToken(),
  });

  return {
    testResults: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export const useCreateTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: Partial<TestResult>) => {
      const res = await ec2Fetch<TestResult>("/api/test-results", {
        method: "POST",
        body: JSON.stringify(result),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "test-results"] });
    },
  });
};

export const useUpdateTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TestResult> & { id: string }) => {
      const res = await ec2Fetch<TestResult>(`/api/test-results/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "test-results"] });
    },
  });
};
