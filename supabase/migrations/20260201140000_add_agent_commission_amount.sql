-- Add agent commission amount (dollars per income) to income table
ALTER TABLE income
ADD COLUMN IF NOT EXISTS agent_commission_amount NUMERIC(12, 2);
