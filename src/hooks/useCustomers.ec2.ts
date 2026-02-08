/**
 * EC2-only useCustomers hook.
 * Calls /api/customers on your self-hosted backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ec2Fetch, getAccessToken } from "@/lib/ec2/client";
import { Customer } from "@/types/user";

export const useCustomers = () => {
  const { data, isLoading, error, refetch } = useQuery<Customer[], Error>({
    queryKey: ["ec2", "customers"],
    queryFn: async () => {
      const res = await ec2Fetch<Customer[]>("/api/customers");
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
    enabled: !!getAccessToken(),
  });

  return {
    customers: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const res = await ec2Fetch<Customer>("/api/customers", {
        method: "POST",
        body: JSON.stringify(customer),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "customers"] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const res = await ec2Fetch<Customer>(`/api/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "customers"] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await ec2Fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.error) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ec2", "customers"] });
    },
  });
};
