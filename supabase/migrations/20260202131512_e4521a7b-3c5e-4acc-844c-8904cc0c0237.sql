-- Create a test sample in pending status for technician workflow testing
INSERT INTO public.samples (barcode, test_type, customer_id, customer_name, lab_id, status, assigned_technician, patient_id)
SELECT 
  'TEST-WORKFLOW-001', 
  'LBC'::test_type, 
  c.id, 
  c.name, 
  'LAB-VIZAG-001', 
  'pending'::sample_status, 
  '41cb8d2b-c178-4676-beda-3ed227deb1e9',
  p.id
FROM public.customers c
CROSS JOIN (SELECT id FROM public.patients LIMIT 1) p
WHERE c.name = 'Apollo Vizag'
LIMIT 1;