-- Vyuhaa Med Screen - Self-Hosted Database Schema
-- PostgreSQL initialization script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUMs
CREATE TYPE user_role AS ENUM ('admin', 'accession', 'technician', 'pathologist', 'customer');
CREATE TYPE customer_tier AS ENUM ('Platinum', 'Gold', 'Silver');
CREATE TYPE sample_status AS ENUM ('pending', 'processing', 'imaging', 'review', 'completed', 'rejected');
CREATE TYPE test_type AS ENUM ('LBC', 'HPV', 'Co-test');

-- Users table (with password hash for local auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    lab_location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    tier customer_tier DEFAULT 'Silver',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    contact_number VARCHAR(50),
    address TEXT,
    medical_history TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab locations table
CREATE TABLE lab_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_info JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing tiers table
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name customer_tier UNIQUE NOT NULL,
    lbc_price DECIMAL(10, 2) NOT NULL,
    hpv_price DECIMAL(10, 2) NOT NULL,
    co_test_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Samples table
CREATE TABLE samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode VARCHAR(100) UNIQUE NOT NULL,
    test_type test_type NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    patient_id UUID REFERENCES patients(id),
    accession_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status sample_status DEFAULT 'pending',
    lab_id VARCHAR(100) NOT NULL,
    assigned_technician UUID REFERENCES users(id),
    assigned_pathologist UUID REFERENCES users(id),
    technician_completed_at TIMESTAMP WITH TIME ZONE,
    pathologist_assigned_at TIMESTAMP WITH TIME ZONE,
    processing_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_assigned_technician ON samples(assigned_technician);
CREATE INDEX idx_samples_assigned_pathologist ON samples(assigned_pathologist);

-- Slide images table
CREATE TABLE slide_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID REFERENCES samples(id),
    user_id UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    tile_name VARCHAR(255), -- For DZI tiles
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_slide_images_sample ON slide_images(sample_id);

-- Test results table
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID NOT NULL REFERENCES samples(id),
    patient_id UUID REFERENCES patients(id),
    test_findings TEXT,
    diagnosis TEXT,
    recommendations TEXT,
    images_uploaded BOOLEAN DEFAULT false,
    report_generated BOOLEAN DEFAULT false,
    report_url VARCHAR(500),
    report_sent_at TIMESTAMP WITH TIME ZONE,
    report_sent_to VARCHAR(255),
    reviewed_by UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_test_results_sample ON test_results(sample_id);

-- Billing records table
CREATE TABLE billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID NOT NULL REFERENCES samples(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    test_type test_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    billing_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Sessions table for JWT refresh tokens
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_samples_updated_at BEFORE UPDATE ON samples FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON test_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_records_updated_at BEFORE UPDATE ON billing_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_locations_updated_at BEFORE UPDATE ON lab_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle sample workflow status changes
CREATE OR REPLACE FUNCTION handle_sample_workflow()
RETURNS TRIGGER AS $$
BEGIN
    -- When technician marks sample as completed processing, move to imaging
    IF NEW.status = 'imaging' AND OLD.status = 'processing' THEN
        NEW.technician_completed_at = NOW();
    END IF;
    
    -- When imaging is completed, automatically assign to pathologist for review
    IF NEW.status = 'review' AND OLD.status = 'imaging' THEN
        IF NEW.assigned_pathologist IS NULL THEN
            SELECT id INTO NEW.assigned_pathologist 
            FROM users 
            WHERE role = 'pathologist' AND is_active = true
            ORDER BY created_at 
            LIMIT 1;
            
            NEW.pathologist_assigned_at = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_sample_status_change
    BEFORE UPDATE ON samples
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION handle_sample_workflow();

-- Function to create billing record on sample completion
CREATE OR REPLACE FUNCTION create_billing_record()
RETURNS TRIGGER AS $$
DECLARE
    customer_record RECORD;
    pricing_record RECORD;
    billing_amount DECIMAL(10,2);
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SELECT * INTO customer_record FROM customers WHERE id = NEW.customer_id;
        SELECT * INTO pricing_record FROM pricing_tiers WHERE tier_name = customer_record.tier;
        
        CASE NEW.test_type
            WHEN 'LBC' THEN billing_amount := pricing_record.lbc_price;
            WHEN 'HPV' THEN billing_amount := pricing_record.hpv_price;
            WHEN 'Co-test' THEN billing_amount := pricing_record.co_test_price;
            ELSE billing_amount := 0;
        END CASE;
        
        INSERT INTO billing_records (sample_id, customer_id, test_type, amount)
        VALUES (NEW.id, NEW.customer_id, NEW.test_type, billing_amount);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_sample_completed
    AFTER UPDATE ON samples
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION create_billing_record();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vyuhaa;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vyuhaa;
