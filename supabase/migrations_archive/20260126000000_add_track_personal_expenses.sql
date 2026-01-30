-- Add track_personal_expenses column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS track_personal_expenses BOOLEAN DEFAULT true;

-- Update existing users to have track_personal_expenses = true
UPDATE users
SET track_personal_expenses = true
WHERE track_personal_expenses IS NULL;
