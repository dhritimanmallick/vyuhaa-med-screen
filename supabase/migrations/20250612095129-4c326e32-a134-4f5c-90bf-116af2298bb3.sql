
-- Create patients table to store patient information
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  contact_number TEXT,
  address TEXT,
  medical_history TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table to store test results and reports
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id UUID NOT NULL REFERENCES public.samples(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id),
  test_findings TEXT,
  diagnosis TEXT,
  recommendations TEXT,
  images_uploaded BOOLEAN DEFAULT FALSE,
  report_generated BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES public.users(id),
  completed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add patient_id to samples table to link samples with patients
ALTER TABLE public.samples ADD COLUMN patient_id UUID REFERENCES public.patients(id);

-- Add workflow tracking columns to samples table
ALTER TABLE public.samples ADD COLUMN technician_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.samples ADD COLUMN pathologist_assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.samples ADD COLUMN processing_notes TEXT;

-- Enable RLS on new tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients table
CREATE POLICY "All authenticated users can view patients" ON public.patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and accession staff can manage patients" ON public.patients
  FOR ALL USING (
    public.get_current_user_role() IN ('admin', 'accession')
  );

-- RLS Policies for test_results table
CREATE POLICY "All authenticated users can view test results" ON public.test_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Technicians can create test results for assigned samples" ON public.test_results
  FOR INSERT WITH CHECK (
    public.get_current_user_role() = 'technician' AND
    EXISTS (
      SELECT 1 FROM public.samples 
      WHERE id = sample_id AND assigned_technician = auth.uid()
    )
  );

CREATE POLICY "Pathologists can update test results for assigned samples" ON public.test_results
  FOR UPDATE USING (
    public.get_current_user_role() = 'pathologist' AND
    EXISTS (
      SELECT 1 FROM public.samples 
      WHERE id = sample_id AND assigned_pathologist = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all test results" ON public.test_results
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create updated_at triggers for new tables
CREATE TRIGGER handle_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_test_results_updated_at
  BEFORE UPDATE ON public.test_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create sample workflow automation function
CREATE OR REPLACE FUNCTION public.handle_sample_workflow()
RETURNS TRIGGER AS $$
BEGIN
  -- When technician marks sample as completed, automatically assign to pathologist
  IF NEW.status = 'review' AND OLD.status = 'processing' THEN
    NEW.technician_completed_at = NOW();
    
    -- Auto-assign to an available pathologist (for demo purposes, assign to first pathologist)
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
$$ LANGUAGE plpgsql;

-- Create trigger for sample workflow automation
CREATE TRIGGER sample_workflow_trigger
  BEFORE UPDATE ON public.samples
  FOR EACH ROW EXECUTE FUNCTION public.handle_sample_workflow();

-- Insert some sample patients for testing
INSERT INTO public.patients (name, age, gender, contact_number, address, medical_history, created_by) VALUES
('John Doe', 45, 'Male', '+91-9876543210', '123 Main St, Mumbai', 'Hypertension, Diabetes', (SELECT id FROM public.users WHERE email = 'admin@vyuhaa.com')),
('Jane Smith', 32, 'Female', '+91-9876543211', '456 Oak Ave, Delhi', 'No significant history', (SELECT id FROM public.users WHERE email = 'admin@vyuhaa.com')),
('Robert Johnson', 58, 'Male', '+91-9876543212', '789 Pine Rd, Bangalore', 'Previous cervical screening abnormal', (SELECT id FROM public.users WHERE email = 'admin@vyuhaa.com'));

-- Update existing samples to link with patients
UPDATE public.samples 
SET patient_id = (
  SELECT id FROM public.patients 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE patient_id IS NULL;

-- Create indexes for better performance
CREATE INDEX idx_patients_created_by ON public.patients(created_by);
CREATE INDEX idx_test_results_sample_id ON public.test_results(sample_id);
CREATE INDEX idx_test_results_patient_id ON public.test_results(patient_id);
CREATE INDEX idx_samples_patient_id ON public.samples(patient_id);
CREATE INDEX idx_samples_technician_completed_at ON public.samples(technician_completed_at);
CREATE INDEX idx_samples_pathologist_assigned_at ON public.samples(pathologist_assigned_at);
