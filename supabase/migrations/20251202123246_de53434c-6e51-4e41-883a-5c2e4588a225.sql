-- Add 'imaging' status to the sample_status enum
ALTER TYPE sample_status ADD VALUE IF NOT EXISTS 'imaging' AFTER 'processing';

-- Update the sample workflow trigger to handle imaging status
CREATE OR REPLACE FUNCTION public.handle_sample_workflow()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- When technician marks sample as completed processing, move to imaging
  IF NEW.status = 'imaging' AND OLD.status = 'processing' THEN
    NEW.technician_completed_at = NOW();
  END IF;
  
  -- When imaging is completed, automatically assign to pathologist for review
  IF NEW.status = 'review' AND OLD.status = 'imaging' THEN
    -- Auto-assign to an available pathologist
    IF NEW.assigned_pathologist IS NULL THEN
      SELECT id INTO NEW.assigned_pathologist 
      FROM public.users 
      WHERE role = 'pathologist' 
      ORDER BY created_at 
      LIMIT 1;
      
      NEW.pathologist_assigned_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;