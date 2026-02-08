-- Add disclaimer acceptance columns to users for Canada-specific legal defensibility
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS disclaimer_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS disclaimer_version TEXT;
