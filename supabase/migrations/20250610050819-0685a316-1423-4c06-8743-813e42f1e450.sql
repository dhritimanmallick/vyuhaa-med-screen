
-- Update all existing users to use Vishakhapatnam as the lab location
UPDATE public.users 
SET lab_location = 'Vishakhapatnam'
WHERE lab_location IS NOT NULL;

-- Update the pathologist specifically
UPDATE public.users 
SET name = 'Dr. Pathologist', lab_location = 'Vishakhapatnam'
WHERE email = 'pathologist@vyuhaa.com';

-- Update other users to Vishakhapatnam location
UPDATE public.users 
SET lab_location = 'Vishakhapatnam'
WHERE email IN ('accession@vyuhaa.com', 'technician@vyuhaa.com', 'customer@vyuhaa.com');
