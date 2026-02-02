-- Create storage bucket for slide images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slide-images', 
  'slide-images', 
  true,
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/tiff', 'image/webp']
);

-- RLS policies for slide-images bucket

-- Technicians can upload slide images
CREATE POLICY "Technicians can upload slide images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'slide-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('technician', 'admin')
    )
  )
);

-- All authenticated users can view slide images
CREATE POLICY "Authenticated users can view slide images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'slide-images');

-- Technicians and admins can update their uploaded slide images
CREATE POLICY "Technicians can update slide images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'slide-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('technician', 'admin')
    )
  )
);

-- Admins can delete slide images
CREATE POLICY "Admins can delete slide images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'slide-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Add sample_id column to slide_images table to link with samples
ALTER TABLE public.slide_images 
ADD COLUMN IF NOT EXISTS sample_id uuid REFERENCES public.samples(id) ON DELETE CASCADE;

-- Add index for faster lookups by sample
CREATE INDEX IF NOT EXISTS idx_slide_images_sample_id ON public.slide_images(sample_id);

-- Update RLS policies for slide_images table to allow pathologists to view
DROP POLICY IF EXISTS "user_can_select_own_images" ON public.slide_images;

CREATE POLICY "Authenticated users can view slide images"
ON public.slide_images
FOR SELECT
TO authenticated
USING (true);

-- Allow technicians to insert slide images
DROP POLICY IF EXISTS "user_can_insert_own_images" ON public.slide_images;

CREATE POLICY "Technicians can insert slide images"
ON public.slide_images
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('technician', 'admin')
    )
  )
);