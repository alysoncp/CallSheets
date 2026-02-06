-- Add IATSE union status to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS iatse_status TEXT DEFAULT 'none';

-- Update existing users to have iatse_status = 'none' if NULL
UPDATE users
SET iatse_status = 'none'
WHERE iatse_status IS NULL;

ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_iatse_status;
ALTER TABLE users
ADD CONSTRAINT check_iatse_status
CHECK (iatse_status IN ('full', 'permittee', 'none'));
