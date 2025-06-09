
-- First, let's make sure we drop the existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the enum types with proper error handling
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'accession', 'technician', 'pathologist', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE test_type AS ENUM ('LBC', 'HPV', 'Co-test');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sample_status AS ENUM ('pending', 'processing', 'review', 'completed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE customer_tier AS ENUM ('Platinum', 'Gold', 'Silver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the pricing_tiers table first
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
    id SERIAL PRIMARY KEY,
    tier_name customer_tier NOT NULL UNIQUE,
    lbc_price DECIMAL(10,2) NOT NULL,
    hpv_price DECIMAL(10,2) NOT NULL,
    co_test_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the users table exists with proper structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'customer',
    lab_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the trigger function with better error handling and type casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
BEGIN
    -- Safely cast the role or default to 'customer'
    BEGIN
        user_role_value := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer'::user_role);
    EXCEPTION
        WHEN OTHERS THEN
            user_role_value := 'customer'::user_role;
    END;
    
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
        NEW.email,
        user_role_value
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Insert default pricing tiers if they don't exist
INSERT INTO public.pricing_tiers (tier_name, lbc_price, hpv_price, co_test_price) 
VALUES
    ('Platinum', 600.00, 900.00, 1350.00),
    ('Gold', 800.00, 1200.00, 1800.00),
    ('Silver', 1000.00, 1500.00, 2250.00)
ON CONFLICT (tier_name) DO NOTHING;
