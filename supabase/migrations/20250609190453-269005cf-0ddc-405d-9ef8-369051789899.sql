
-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'accession', 'technician', 'pathologist', 'customer');
CREATE TYPE test_type AS ENUM ('LBC', 'HPV', 'Co-test');
CREATE TYPE sample_status AS ENUM ('pending', 'processing', 'review', 'completed', 'rejected');
CREATE TYPE customer_tier AS ENUM ('Platinum', 'Gold', 'Silver');

-- Create users/profiles table that extends auth.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  lab_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  tier customer_tier NOT NULL DEFAULT 'Silver',
  email TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing tiers table
CREATE TABLE public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name customer_tier NOT NULL UNIQUE,
  lbc_price DECIMAL(10,2) NOT NULL,
  hpv_price DECIMAL(10,2) NOT NULL,
  co_test_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create samples table
CREATE TABLE public.samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL UNIQUE,
  test_type test_type NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  accession_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status sample_status NOT NULL DEFAULT 'pending',
  lab_id TEXT NOT NULL,
  assigned_technician UUID REFERENCES public.users(id),
  assigned_pathologist UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- RLS Policies for customers table
CREATE POLICY "All authenticated users can view customers" ON public.customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage customers" ON public.customers
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Accession staff can manage customers" ON public.customers
  FOR ALL USING (public.get_current_user_role() = 'accession');

-- RLS Policies for pricing_tiers table
CREATE POLICY "All authenticated users can view pricing tiers" ON public.pricing_tiers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage pricing tiers" ON public.pricing_tiers
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for samples table
CREATE POLICY "All authenticated users can view samples" ON public.samples
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage all samples" ON public.samples
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Accession staff can create samples" ON public.samples
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'accession');

CREATE POLICY "Technicians can update assigned samples" ON public.samples
  FOR UPDATE USING (
    public.get_current_user_role() = 'technician' 
    AND assigned_technician = auth.uid()
  );

CREATE POLICY "Pathologists can update assigned samples" ON public.samples
  FOR UPDATE USING (
    public.get_current_user_role() = 'pathologist' 
    AND assigned_pathologist = auth.uid()
  );

-- Create trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_pricing_tiers_updated_at
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_samples_updated_at
  BEFORE UPDATE ON public.samples
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger function to automatically create user profile
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

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default pricing tiers
INSERT INTO public.pricing_tiers (tier_name, lbc_price, hpv_price, co_test_price) VALUES
  ('Platinum', 600.00, 900.00, 1350.00),
  ('Gold', 800.00, 1200.00, 1800.00),
  ('Silver', 1000.00, 1500.00, 2250.00);

-- Create indexes for better performance
CREATE INDEX idx_samples_barcode ON public.samples(barcode);
CREATE INDEX idx_samples_customer_id ON public.samples(customer_id);
CREATE INDEX idx_samples_status ON public.samples(status);
CREATE INDEX idx_samples_assigned_technician ON public.samples(assigned_technician);
CREATE INDEX idx_samples_assigned_pathologist ON public.samples(assigned_pathologist);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_customers_tier ON public.customers(tier);
