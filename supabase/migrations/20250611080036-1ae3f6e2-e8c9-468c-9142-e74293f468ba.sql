
-- First, let's drop any existing problematic RLS policies on the users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;

-- Create a security definer function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Create new RLS policies that don't cause infinite recursion
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage users" 
  ON public.users 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin');

-- Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
