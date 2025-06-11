
-- First, drop all policies that depend on get_current_user_role function
-- Users table policies
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin can insert users" ON public.users;
DROP POLICY IF EXISTS "Admin can update users" ON public.users;
DROP POLICY IF EXISTS "Admin can delete users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Customers table policies
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Accession staff can manage customers" ON public.customers;

-- Pricing tiers table policies
DROP POLICY IF EXISTS "Admins can manage pricing tiers" ON public.pricing_tiers;

-- Samples table policies
DROP POLICY IF EXISTS "Admins can manage all samples" ON public.samples;
DROP POLICY IF EXISTS "Accession staff can create samples" ON public.samples;
DROP POLICY IF EXISTS "Technicians can update assigned samples" ON public.samples;
DROP POLICY IF EXISTS "Pathologists can update assigned samples" ON public.samples;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Disable RLS temporarily on users table to fix the recursive issue
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with simple, non-recursive policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for users table
CREATE POLICY "users_can_view_own_profile" ON public.users
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON public.users
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile" ON public.users
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow service_role to manage all users (for admin functions)
CREATE POLICY "service_role_can_manage_users" ON public.users
FOR ALL 
TO service_role 
USING (true);

-- Create a new, improved security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Recreate essential policies for other tables using the new function
-- Allow admins to manage customers
CREATE POLICY "admins_can_manage_customers" ON public.customers
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Allow accession staff to manage customers
CREATE POLICY "accession_can_manage_customers" ON public.customers
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'accession');

-- Allow admins to manage pricing tiers
CREATE POLICY "admins_can_manage_pricing_tiers" ON public.pricing_tiers
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Allow admins to manage all samples
CREATE POLICY "admins_can_manage_samples" ON public.samples
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Allow accession staff to create and view samples
CREATE POLICY "accession_can_manage_samples" ON public.samples
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'accession');

-- Allow technicians to view and update samples assigned to them
CREATE POLICY "technicians_can_update_assigned_samples" ON public.samples
FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() = 'technician' 
  AND (assigned_technician = auth.uid() OR assigned_technician IS NULL)
);

CREATE POLICY "technicians_can_update_samples" ON public.samples
FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() = 'technician' 
  AND assigned_technician = auth.uid()
);

-- Allow pathologists to view and update samples assigned to them
CREATE POLICY "pathologists_can_view_assigned_samples" ON public.samples
FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() = 'pathologist' 
  AND (assigned_pathologist = auth.uid() OR assigned_pathologist IS NULL)
);

CREATE POLICY "pathologists_can_update_samples" ON public.samples
FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() = 'pathologist' 
  AND assigned_pathologist = auth.uid()
);

-- Allow customers to view their own samples
CREATE POLICY "customers_can_view_own_samples" ON public.samples
FOR SELECT
TO authenticated
USING (public.get_current_user_role() = 'customer');
