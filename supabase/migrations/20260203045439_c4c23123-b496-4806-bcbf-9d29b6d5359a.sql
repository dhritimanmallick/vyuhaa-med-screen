-- Drop the existing restrictive technician update policy
DROP POLICY IF EXISTS "technicians_can_update_samples" ON public.samples;

-- Create a new policy that allows technicians to:
-- 1. Update samples assigned to them
-- 2. Pick up unassigned pending samples (assign themselves)
CREATE POLICY "technicians_can_update_samples" 
ON public.samples 
FOR UPDATE 
USING (
  (get_current_user_role() = 'technician'::user_role) 
  AND (
    -- Can update samples already assigned to them
    assigned_technician = auth.uid() 
    OR 
    -- Can pick up unassigned pending samples
    (status = 'pending' AND assigned_technician IS NULL)
  )
);