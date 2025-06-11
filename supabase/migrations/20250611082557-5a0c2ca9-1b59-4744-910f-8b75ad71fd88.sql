
-- Update test user passwords to Password@1
UPDATE auth.users 
SET encrypted_password = crypt('Password@1', gen_salt('bf'))
WHERE email IN (
  'admin@vyuhaa.com',
  'pathologist@vyuhaa.com', 
  'accession@vyuhaa.com',
  'technician@vyuhaa.com',
  'customer@vyuhaa.com'
);
