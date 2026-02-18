-- Security hardening: receipts and paystubs must not be publicly readable.
-- Keep object access behind auth + storage policies/signed URLs.

UPDATE storage.buckets
SET public = false
WHERE id IN ('receipts', 'paystubs');
