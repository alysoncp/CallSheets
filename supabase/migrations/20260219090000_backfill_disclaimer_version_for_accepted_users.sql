-- Backfill disclaimer_version for legacy users who already accepted the disclaimer
-- but do not have a stored version. This prevents unnecessary re-prompts.

UPDATE public.users
SET
  disclaimer_version = 'CA_v1.0',
  updated_at = NOW()
WHERE
  disclaimer_accepted_at IS NOT NULL
  AND (disclaimer_version IS NULL OR disclaimer_version = '');
