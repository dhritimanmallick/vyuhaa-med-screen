
-- Drop existing problematic RLS policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;

-- Disable RLS temporarily to fix the recursive issue
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "users_select_own" ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "users_update_own" ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Allow user creation during signup
CREATE POLICY "users_insert_own" ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);
