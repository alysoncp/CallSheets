-- Add ubcp_actra_status column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS ubcp_actra_status TEXT DEFAULT 'none';

-- Add check constraint to ensure valid values
ALTER TABLE users
ADD CONSTRAINT check_ubcp_actra_status 
CHECK (ubcp_actra_status IN ('none', 'background', 'apprentice', 'full_member'));

-- Update existing users to have ubcp_actra_status = 'none' if NULL
UPDATE users
SET ubcp_actra_status = 'none'
WHERE ubcp_actra_status IS NULL;
