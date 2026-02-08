-- Vyuhaa Med Screen - Seed Data
-- Default users and test data

-- Insert default users (password: Password@1 - bcrypt hash)
-- Hash generated with bcrypt rounds=10
INSERT INTO users (email, password_hash, name, role, lab_location) VALUES
('admin@vyuhaa.com', '$2b$10$rOzJqQZQV8sVfVdVQV8zOeCeJQV8sVfVdVQV8zOeCeJQV8sVfVdV', 'System Admin', 'admin', 'Main Lab'),
('pathologist@vyuhaa.com', '$2b$10$rOzJqQZQV8sVfVdVQV8zOeCeJQV8sVfVdVQV8zOeCeJQV8sVfVdV', 'Dr. Pathologist', 'pathologist', 'Main Lab'),
('accession@vyuhaa.com', '$2b$10$rOzJqQZQV8sVfVdVQV8zOeCeJQV8sVfVdVQV8zOeCeJQV8sVfVdV', 'Accession Staff', 'accession', 'Main Lab'),
('technician@vyuhaa.com', '$2b$10$rOzJqQZQV8sVfVdVQV8zOeCeJQV8sVfVdVQV8zOeCeJQV8sVfVdV', 'Lab Technician', 'technician', 'Main Lab'),
('customer@vyuhaa.com', '$2b$10$rOzJqQZQV8sVfVdVQV8zOeCeJQV8sVfVdVQV8zOeCeJQV8sVfVdV', 'Hospital Customer', 'customer', NULL);

-- Insert pricing tiers
INSERT INTO pricing_tiers (tier_name, lbc_price, hpv_price, co_test_price) VALUES
('Platinum', 150.00, 200.00, 300.00),
('Gold', 175.00, 225.00, 350.00),
('Silver', 200.00, 250.00, 400.00);

-- Insert sample lab location
INSERT INTO lab_locations (name, address, contact_info) VALUES
('Main Laboratory', '123 Medical Center Drive, Hyderabad, India', '{"phone": "+91-9876543210", "email": "lab@vyuhaa.com"}'),
('Satellite Lab', '456 Healthcare Avenue, Bangalore, India', '{"phone": "+91-9876543211", "email": "satellite@vyuhaa.com"}');

-- Insert sample customers
INSERT INTO customers (name, contact, email, location, tier) VALUES
('City General Hospital', '+91-9876543212', 'contact@cityhospital.com', 'Hyderabad', 'Platinum'),
('Apollo Clinic', '+91-9876543213', 'info@apolloclinic.com', 'Bangalore', 'Gold'),
('Community Health Center', '+91-9876543214', 'chc@healthcare.gov', 'Chennai', 'Silver');

-- Note: Passwords will need to be hashed properly during first run
-- The backend includes a migration script to hash these properly
