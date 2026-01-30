-- Enable RLS and create policies for all tables
-- This ensures users can only access their own data

-- ============================================
-- USERS TABLE
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (id = auth.uid());

-- ============================================
-- INCOME TABLE
-- ============================================
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own income" ON income;
DROP POLICY IF EXISTS "Users can insert their own income" ON income;
DROP POLICY IF EXISTS "Users can update their own income" ON income;
DROP POLICY IF EXISTS "Users can delete their own income" ON income;

CREATE POLICY "Users can view their own income"
ON income FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own income"
ON income FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own income"
ON income FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own income"
ON income FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- EXPENSES TABLE
-- ============================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

CREATE POLICY "Users can view their own expenses"
ON expenses FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own expenses"
ON expenses FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expenses"
ON expenses FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own expenses"
ON expenses FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- VEHICLES TABLE
-- ============================================
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON vehicles;

CREATE POLICY "Users can view their own vehicles"
ON vehicles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own vehicles"
ON vehicles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vehicles"
ON vehicles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own vehicles"
ON vehicles FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- VEHICLE_MILEAGE_LOGS TABLE
-- ============================================
ALTER TABLE vehicle_mileage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mileage logs" ON vehicle_mileage_logs;
DROP POLICY IF EXISTS "Users can insert their own mileage logs" ON vehicle_mileage_logs;
DROP POLICY IF EXISTS "Users can update their own mileage logs" ON vehicle_mileage_logs;
DROP POLICY IF EXISTS "Users can delete their own mileage logs" ON vehicle_mileage_logs;

CREATE POLICY "Users can view their own mileage logs"
ON vehicle_mileage_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own mileage logs"
ON vehicle_mileage_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own mileage logs"
ON vehicle_mileage_logs FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own mileage logs"
ON vehicle_mileage_logs FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- ODOMETER_PHOTOS TABLE
-- ============================================
ALTER TABLE odometer_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own odometer photos" ON odometer_photos;
DROP POLICY IF EXISTS "Users can insert their own odometer photos" ON odometer_photos;
DROP POLICY IF EXISTS "Users can update their own odometer photos" ON odometer_photos;
DROP POLICY IF EXISTS "Users can delete their own odometer photos" ON odometer_photos;

CREATE POLICY "Users can view their own odometer photos"
ON odometer_photos FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own odometer photos"
ON odometer_photos FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own odometer photos"
ON odometer_photos FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own odometer photos"
ON odometer_photos FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- ASSETS TABLE
-- ============================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;

CREATE POLICY "Users can view their own assets"
ON assets FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own assets"
ON assets FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own assets"
ON assets FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own assets"
ON assets FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- ASSET_CCA_HISTORY TABLE
-- ============================================
ALTER TABLE asset_cca_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own asset CCA history" ON asset_cca_history;
DROP POLICY IF EXISTS "Users can insert their own asset CCA history" ON asset_cca_history;
DROP POLICY IF EXISTS "Users can update their own asset CCA history" ON asset_cca_history;
DROP POLICY IF EXISTS "Users can delete their own asset CCA history" ON asset_cca_history;

CREATE POLICY "Users can view their own asset CCA history"
ON asset_cca_history FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own asset CCA history"
ON asset_cca_history FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own asset CCA history"
ON asset_cca_history FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own asset CCA history"
ON asset_cca_history FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- LEASE_CONTRACTS TABLE
-- ============================================
ALTER TABLE lease_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own lease contracts" ON lease_contracts;
DROP POLICY IF EXISTS "Users can insert their own lease contracts" ON lease_contracts;
DROP POLICY IF EXISTS "Users can update their own lease contracts" ON lease_contracts;
DROP POLICY IF EXISTS "Users can delete their own lease contracts" ON lease_contracts;

CREATE POLICY "Users can view their own lease contracts"
ON lease_contracts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own lease contracts"
ON lease_contracts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own lease contracts"
ON lease_contracts FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own lease contracts"
ON lease_contracts FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- LEASE_PAYMENTS TABLE
-- ============================================
ALTER TABLE lease_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own lease payments" ON lease_payments;
DROP POLICY IF EXISTS "Users can insert their own lease payments" ON lease_payments;
DROP POLICY IF EXISTS "Users can update their own lease payments" ON lease_payments;
DROP POLICY IF EXISTS "Users can delete their own lease payments" ON lease_payments;

CREATE POLICY "Users can view their own lease payments"
ON lease_payments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own lease payments"
ON lease_payments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own lease payments"
ON lease_payments FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own lease payments"
ON lease_payments FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- RECEIPTS TABLE
-- ============================================
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON receipts;

CREATE POLICY "Users can view their own receipts"
ON receipts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own receipts"
ON receipts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own receipts"
ON receipts FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own receipts"
ON receipts FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- PAYSTUBS TABLE
-- ============================================
ALTER TABLE paystubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own paystubs" ON paystubs;
DROP POLICY IF EXISTS "Users can insert their own paystubs" ON paystubs;
DROP POLICY IF EXISTS "Users can update their own paystubs" ON paystubs;
DROP POLICY IF EXISTS "Users can delete their own paystubs" ON paystubs;

CREATE POLICY "Users can view their own paystubs"
ON paystubs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own paystubs"
ON paystubs FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own paystubs"
ON paystubs FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own paystubs"
ON paystubs FOR DELETE
USING (user_id = auth.uid());
