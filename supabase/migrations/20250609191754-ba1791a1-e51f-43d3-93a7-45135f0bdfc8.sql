
-- Only create enum types if they don't exist
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

-- Create or update trigger function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default pricing tiers if they don't exist
INSERT INTO public.pricing_tiers (tier_name, lbc_price, hpv_price, co_test_price) 
VALUES
  ('Platinum', 600.00, 900.00, 1350.00),
  ('Gold', 800.00, 1200.00, 1800.00),
  ('Silver', 1000.00, 1500.00, 2250.00)
ON CONFLICT (tier_name) DO NOTHING;
