-- Fix the billing record trigger to use SECURITY DEFINER so it can bypass RLS
-- when called by pathologists completing reviews
CREATE OR REPLACE FUNCTION public.create_billing_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
    
    -- Insert billing record (SECURITY DEFINER allows bypassing RLS)
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
$function$;