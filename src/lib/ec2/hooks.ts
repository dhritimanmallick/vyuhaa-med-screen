/**
 * EC2-only data hooks.
 * These call relative /api/* endpoints, using JWT from the EC2 client.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ec2Fetch, getAccessToken } from "./client";

/* ------------------------------------------------------------------ */
/* Types (mirror Supabase types for compatibility)                    */
/* ------------------------------------------------------------------ */

export type UserRole = "admin" | "accession" | "technician" | "pathologist" | "customer";
export type SampleStatus = "pending" | "processing" | "imaging" | "review" | "completed" | "rejected";
export type TestType = "LBC" | "HPV" | "Co-test";
export type CustomerTier = "Platinum" | "Gold" | "Silver";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lab_location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  contact_number?: string;
  address?: string;
  medical_history?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  contact: string;
  location: string;
  tier: CustomerTier;
  created_at?: string;
  updated_at?: string;
}

export interface Sample {
  id: string;
  barcode: string;
  customer_id: string;
  customer_name: string;
  lab_id: string;
  patient_id?: string;
  test_type: TestType;
  status: SampleStatus;
  assigned_technician?: string;
  assigned_pathologist?: string;
  accession_date?: string;
  technician_completed_at?: string;
  pathologist_assigned_at?: string;
  processing_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TestResult {
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

export interface SlideImage {
  id: string;
  user_id: string;
  sample_id?: string;
  file_name: string;
  upload_url?: string;
  uploaded_at: string;
}

export interface LabLocation {
  id: string;
  name: string;
  address?: string;
  contact_info?: Record<string, unknown>;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PricingTier {
  id: string;
  tier_name: CustomerTier;
  lbc_price: number;
  hpv_price: number;
  co_test_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface BillingRecord {
  id: string;
  sample_id: string;
  customer_id: string;
  test_type: TestType;
  amount: number;
  billing_date?: string;
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
}

/* ------------------------------------------------------------------ */
/* Generic list/get helpers                                           */
/* ------------------------------------------------------------------ */

async function fetchList<T>(endpoint: string): Promise<T[]> {
  const res = await ec2Fetch<T[]>(endpoint);
  if (res.error) throw new Error(res.error);
  return res.data ?? [];
}

async function fetchOne<T>(endpoint: string): Promise<T | null> {
  const res = await ec2Fetch<T>(endpoint);
  if (res.error) throw new Error(res.error);
  return res.data;
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export const useUsers = () =>
  useQuery<User[], Error>({
    queryKey: ["ec2", "users"],
    queryFn: () => fetchList<User>("/api/users"),
    enabled: !!getAccessToken(),
  });

export const useUser = (id: string) =>
  useQuery<User | null, Error>({
    queryKey: ["ec2", "users", id],
    queryFn: () => fetchOne<User>(`/api/users/${id}`),
    enabled: !!getAccessToken() && !!id,
  });

/* ------------------------------------------------------------------ */
/* Patients                                                            */
/* ------------------------------------------------------------------ */

export const usePatients = () =>
  useQuery<Patient[], Error>({
    queryKey: ["ec2", "patients"],
    queryFn: () => fetchList<Patient>("/api/patients"),
    enabled: !!getAccessToken(),
  });

export const usePatient = (id: string) =>
  useQuery<Patient | null, Error>({
    queryKey: ["ec2", "patients", id],
    queryFn: () => fetchOne<Patient>(`/api/patients/${id}`),
    enabled: !!getAccessToken() && !!id,
  });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patient: Partial<Patient>) => {
      const res = await ec2Fetch<Patient>("/api/patients", {
        method: "POST",
        body: JSON.stringify(patient),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ec2", "patients"] }),
  });
};

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

export const useCustomers = () =>
  useQuery<Customer[], Error>({
    queryKey: ["ec2", "customers"],
    queryFn: () => fetchList<Customer>("/api/customers"),
    enabled: !!getAccessToken(),
  });

export const useCustomer = (id: string) =>
  useQuery<Customer | null, Error>({
    queryKey: ["ec2", "customers", id],
    queryFn: () => fetchOne<Customer>(`/api/customers/${id}`),
    enabled: !!getAccessToken() && !!id,
  });

/* ------------------------------------------------------------------ */
/* Samples                                                             */
/* ------------------------------------------------------------------ */

export const useSamples = () =>
  useQuery<Sample[], Error>({
    queryKey: ["ec2", "samples"],
    queryFn: () => fetchList<Sample>("/api/samples"),
    enabled: !!getAccessToken(),
  });

export const useSample = (id: string) =>
  useQuery<Sample | null, Error>({
    queryKey: ["ec2", "samples", id],
    queryFn: () => fetchOne<Sample>(`/api/samples/${id}`),
    enabled: !!getAccessToken() && !!id,
  });

export const useUpdateSample = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sample> & { id: string }) => {
      const res = await ec2Fetch<Sample>(`/api/samples/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ec2", "samples"] }),
  });
};

/* ------------------------------------------------------------------ */
/* Test Results                                                        */
/* ------------------------------------------------------------------ */

export const useTestResults = () =>
  useQuery<TestResult[], Error>({
    queryKey: ["ec2", "test-results"],
    queryFn: () => fetchList<TestResult>("/api/test-results"),
    enabled: !!getAccessToken(),
  });

export const useTestResult = (id: string) =>
  useQuery<TestResult | null, Error>({
    queryKey: ["ec2", "test-results", id],
    queryFn: () => fetchOne<TestResult>(`/api/test-results/${id}`),
    enabled: !!getAccessToken() && !!id,
  });

/* ------------------------------------------------------------------ */
/* Slide Images                                                        */
/* ------------------------------------------------------------------ */

export const useSlideImages = (sampleId?: string) =>
  useQuery<SlideImage[], Error>({
    queryKey: ["ec2", "slide-images", sampleId],
    queryFn: () =>
      fetchList<SlideImage>(sampleId ? `/api/upload/slides/${sampleId}` : "/api/upload/slides"),
    enabled: !!getAccessToken(),
  });

/* ------------------------------------------------------------------ */
/* Lab Locations                                                       */
/* ------------------------------------------------------------------ */

export const useLabLocations = () =>
  useQuery<LabLocation[], Error>({
    queryKey: ["ec2", "lab-locations"],
    queryFn: () => fetchList<LabLocation>("/api/lab-locations"),
    enabled: !!getAccessToken(),
  });

/* ------------------------------------------------------------------ */
/* Pricing Tiers                                                       */
/* ------------------------------------------------------------------ */

export const usePricingTiers = () =>
  useQuery<PricingTier[], Error>({
    queryKey: ["ec2", "pricing"],
    queryFn: () => fetchList<PricingTier>("/api/pricing"),
    enabled: !!getAccessToken(),
  });

/* ------------------------------------------------------------------ */
/* Billing Records                                                     */
/* ------------------------------------------------------------------ */

export const useBillingRecords = () =>
  useQuery<BillingRecord[], Error>({
    queryKey: ["ec2", "billing"],
    queryFn: () => fetchList<BillingRecord>("/api/billing"),
    enabled: !!getAccessToken(),
  });
