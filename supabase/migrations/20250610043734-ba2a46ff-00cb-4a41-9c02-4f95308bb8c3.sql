
-- Create an admin user directly in the auth.users table
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
  'admin@vyuhaa.com',
  crypt('Password@1', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User","role":"admin"}',
  false,
  '',
  '',
  '',
  ''
);

-- Also create the corresponding user profile
INSERT INTO public.users (id, name, email, role, lab_location)
SELECT 
  id,
  'Admin User',
  'admin@vyuhaa.com',
  'admin'::user_role,
  'All Labs'
FROM auth.users 
WHERE email = 'admin@vyuhaa.com'
ON CONFLICT (id) DO NOTHING;
