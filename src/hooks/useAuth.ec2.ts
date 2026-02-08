/**
 * EC2 Auth Hook - Drop-in replacement for Supabase useAuth
 * This file re-exports from the EC2 module for the EC2 branch.
 */

export { useAuth } from "@/lib/ec2/useAuth";
export type { UseAuthReturn } from "@/lib/ec2/useAuth";
