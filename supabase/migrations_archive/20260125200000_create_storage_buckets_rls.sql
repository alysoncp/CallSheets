-- Create RLS policies for storage buckets
-- Note: Buckets must be created manually via Supabase Studio or Storage API
-- Required buckets: receipts, paystubs, odometer-photos
-- Note: RLS is already enabled on storage.objects by Supabase

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can upload receipts to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload paystubs to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own paystubs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own paystubs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload odometer photos to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own odometer photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own odometer photos" ON storage.objects;

-- Create policies for receipts bucket
-- Policy: Users can insert files into their own folder (path: {user_id}/{filename})
CREATE POLICY "Users can upload receipts to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own receipts
CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own receipts
CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policies for paystubs bucket
CREATE POLICY "Users can upload paystubs to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'paystubs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own paystubs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'paystubs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own paystubs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'paystubs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policies for odometer-photos bucket
CREATE POLICY "Users can upload odometer photos to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'odometer-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own odometer photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'odometer-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own odometer photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'odometer-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
