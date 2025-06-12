
-- Add report generation fields to test_results table
ALTER TABLE public.test_results 
ADD COLUMN IF NOT EXISTS report_url TEXT,
ADD COLUMN IF NOT EXISTS report_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS report_sent_to TEXT;

-- Create a table to track revenue and billing
CREATE TABLE IF NOT EXISTS public.billing_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sample_id UUID REFERENCES public.samples(id) NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  test_type test_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on billing_records
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for billing_records
CREATE POLICY "All authenticated users can view billing records" ON public.billing_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage billing records" ON public.billing_records
  FOR ALL TO authenticated USING (
    public.get_current_user_role() = 'admin'
  );

-- Create trigger to automatically generate billing record when sample is completed
CREATE OR REPLACE FUNCTION public.create_billing_record()
RETURNS TRIGGER AS $$
DECLARE
  customer_record RECORD;
  pricing_record RECORD;
  billing_amount DECIMAL(10,2);
BEGIN
  -- Only create billing record when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get customer info
    SELECT * INTO customer_record FROM public.customers WHERE id = NEW.customer_id;
    
    -- Get pricing based on customer tier and test type
    SELECT * INTO pricing_record FROM public.pricing_tiers WHERE tier_name = customer_record.tier;
    
    -- Calculate billing amount based on test type
    CASE NEW.test_type
      WHEN 'LBC' THEN billing_amount := pricing_record.lbc_price;
      WHEN 'HPV' THEN billing_amount := pricing_record.hpv_price;
      WHEN 'Co-test' THEN billing_amount := pricing_record.co_test_price;
      ELSE billing_amount := 0;
    END CASE;
    
    -- Insert billing record
    INSERT INTO public.billing_records (
      sample_id,
      customer_id,
      test_type,
      amount
    ) VALUES (
      NEW.id,
      NEW.customer_id,
      NEW.test_type,
      billing_amount
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for billing record generation
DROP TRIGGER IF EXISTS trigger_create_billing_record ON public.samples;
CREATE TRIGGER trigger_create_billing_record
  AFTER UPDATE ON public.samples
  FOR EACH ROW
  EXECUTE FUNCTION public.create_billing_record();

-- Create updated_at trigger for billing_records
CREATE TRIGGER trigger_billing_records_updated_at
  BEFORE UPDATE ON public.billing_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add audit trigger for billing_records
CREATE TRIGGER audit_billing_records_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.billing_records
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();
