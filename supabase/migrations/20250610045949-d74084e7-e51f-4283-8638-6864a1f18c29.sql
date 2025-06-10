
-- Create sample users for all roles
-- Insert users into auth.users table with different roles

-- Accession user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'accession@vyuhaa.com',
  crypt('Password@1', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Accession Team","role":"accession"}',
  false,
  '',
  '',
  '',
  ''
);

-- Technician user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'technician@vyuhaa.com',
  crypt('Password@1', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Lab Technician","role":"technician"}',
  false,
  '',
  '',
  '',
  ''
);

-- Pathologist user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'pathologist@vyuhaa.com',
  crypt('Password@1', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Dr. Pathologist","role":"pathologist"}',
  false,
  '',
  '',
  '',
  ''
);

-- Customer user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'customer@vyuhaa.com',
  crypt('Password@1', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Customer User","role":"customer"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create corresponding user profiles for all new users
INSERT INTO public.users (id, name, email, role, lab_location)
SELECT 
  id,
  'Accession Team',
  'accession@vyuhaa.com',
  'accession'::user_role,
  'Mumbai Central'
FROM auth.users 
WHERE email = 'accession@vyuhaa.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, role, lab_location)
SELECT 
  id,
  'Lab Technician',
  'technician@vyuhaa.com',
  'technician'::user_role,
  'Delhi North'
FROM auth.users 
WHERE email = 'technician@vyuhaa.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, role, lab_location)
SELECT 
  id,
  'Dr. Pathologist',
  'pathologist@vyuhaa.com',
  'pathologist'::user_role,
  'Bangalore Central'
FROM auth.users 
WHERE email = 'pathologist@vyuhaa.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, role, lab_location)
SELECT 
  id,
  'Customer User',
  'customer@vyuhaa.com',
  'customer'::user_role,
  'Chennai South'
FROM auth.users 
WHERE email = 'customer@vyuhaa.com'
ON CONFLICT (id) DO NOTHING;
