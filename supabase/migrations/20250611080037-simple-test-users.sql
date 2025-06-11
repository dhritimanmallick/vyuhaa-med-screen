
-- Create simple test users with basic auth
-- First, let's ensure we have test users in auth.users

-- Insert test users into auth.users if they don't exist
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@vyuhaa.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'pathologist@vyuhaa.com',
  crypt('path123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
),
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'accession@vyuhaa.com',
  crypt('acc123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
),
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'technician@vyuhaa.com',
  crypt('tech123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
),
(
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'customer@vyuhaa.com',
  crypt('cust123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Insert corresponding user profiles
INSERT INTO public.users (id, name, email, role, lab_location) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@vyuhaa.com', 'admin', 'Main Lab'),
('22222222-2222-2222-2222-222222222222', 'Dr. Pathologist', 'pathologist@vyuhaa.com', 'pathologist', 'Main Lab'),
('33333333-3333-3333-3333-333333333333', 'Accession Staff', 'accession@vyuhaa.com', 'accession', 'Main Lab'),
('44444444-4444-4444-4444-444444444444', 'Lab Technician', 'technician@vyuhaa.com', 'technician', 'Main Lab'),
('55555555-5555-5555-5555-555555555555', 'Test Customer', 'customer@vyuhaa.com', 'customer', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  lab_location = EXCLUDED.lab_location;
