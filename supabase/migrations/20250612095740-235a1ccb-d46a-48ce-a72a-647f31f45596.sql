
-- Enable RLS on all tables if not already enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "All authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
DROP POLICY IF EXISTS "All authenticated users can view lab locations" ON public.lab_locations;
DROP POLICY IF EXISTS "Admins can manage lab locations" ON public.lab_locations;
DROP POLICY IF EXISTS "All authenticated users can view samples" ON public.samples;
DROP POLICY IF EXISTS "Admins and accession staff can manage samples" ON public.samples;
DROP POLICY IF EXISTS "All authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "All authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Admins and accession staff can manage patients" ON public.patients;
DROP POLICY IF EXISTS "All authenticated users can view test results" ON public.test_results;
DROP POLICY IF EXISTS "Admins can manage all test results" ON public.test_results;
DROP POLICY IF EXISTS "All authenticated users can view pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Admins can manage pricing tiers" ON public.pricing_tiers;

-- Create comprehensive RLS policies for data persistence

-- Customers table policies
CREATE POLICY "All authenticated users can view customers" ON public.customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert customers" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update customers" ON public.customers
  FOR UPDATE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete customers" ON public.customers
  FOR DELETE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

-- Lab locations table policies
CREATE POLICY "All authenticated users can view lab locations" ON public.lab_locations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert lab locations" ON public.lab_locations
  FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update lab locations" ON public.lab_locations
  FOR UPDATE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete lab locations" ON public.lab_locations
  FOR DELETE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

-- Samples table policies
CREATE POLICY "All authenticated users can view samples" ON public.samples
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and accession staff can insert samples" ON public.samples
  FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() IN ('admin', 'accession')
  );

CREATE POLICY "Admins and accession staff can update samples" ON public.samples
  FOR UPDATE TO authenticated USING (
    public.get_current_user_role() IN ('admin', 'accession') OR
    assigned_technician = auth.uid() OR
    assigned_pathologist = auth.uid()
  );

CREATE POLICY "Admins can delete samples" ON public.samples
  FOR DELETE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

-- Users table policies
CREATE POLICY "All authenticated users can view users" ON public.users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

-- Patients table policies
CREATE POLICY "All authenticated users can view patients" ON public.patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and accession staff can insert patients" ON public.patients
  FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() IN ('admin', 'accession')
  );

CREATE POLICY "Admins and accession staff can update patients" ON public.patients
  FOR UPDATE TO authenticated USING (
    public.get_current_user_role() IN ('admin', 'accession')
  );

CREATE POLICY "Admins can delete patients" ON public.patients
  FOR DELETE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

-- Test results table policies
CREATE POLICY "All authenticated users can view test results" ON public.test_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Technicians and pathologists can insert test results" ON public.test_results
  FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() IN ('technician', 'pathologist', 'admin')
  );

CREATE POLICY "Technicians and pathologists can update test results" ON public.test_results
  FOR UPDATE TO authenticated USING (
    public.get_current_user_role() IN ('technician', 'pathologist', 'admin')
  );

CREATE POLICY "Admins can delete test results" ON public.test_results
  FOR DELETE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

-- Pricing tiers table policies
CREATE POLICY "All authenticated users can view pricing tiers" ON public.pricing_tiers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert pricing tiers" ON public.pricing_tiers
  FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update pricing tiers" ON public.pricing_tiers
  FOR UPDATE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete pricing tiers" ON public.pricing_tiers
  FOR DELETE TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

-- Create audit log trigger function for tracking data changes
CREATE OR REPLACE FUNCTION public.trigger_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the operation
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'CREATE',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::text,
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for all tables
CREATE TRIGGER audit_customers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_lab_locations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.lab_locations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_samples_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.samples
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_patients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_test_results_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.test_results
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_pricing_tiers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();
