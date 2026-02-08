-- RLS Disclaimer Gate: require users to have accepted disclaimer before accessing app data.
-- Add EXISTS(users where disclaimer_accepted_at IS NOT NULL) to all user-owned tables.
-- Prevent users from unsetting disclaimer_accepted_at (WITH CHECK on users UPDATE).

-- Helper condition for "user has accepted disclaimer"
-- We add this to USING and WITH CHECK for all tables except users (users needs special UPDATE check).

-- USERS: only change UPDATE policy so disclaimer_accepted_at cannot be set to null once set
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND disclaimer_accepted_at IS NOT NULL);

-- INCOME
DROP POLICY IF EXISTS "Users can view their own income" ON income;
CREATE POLICY "Users can view their own income" ON income FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own income" ON income;
CREATE POLICY "Users can insert their own income" ON income FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own income" ON income;
CREATE POLICY "Users can update their own income" ON income FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own income" ON income;
CREATE POLICY "Users can delete their own income" ON income FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- EXPENSES
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- VEHICLES
DROP POLICY IF EXISTS "Users can view their own vehicles" ON vehicles;
CREATE POLICY "Users can view their own vehicles" ON vehicles FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own vehicles" ON vehicles;
CREATE POLICY "Users can insert their own vehicles" ON vehicles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own vehicles" ON vehicles;
CREATE POLICY "Users can update their own vehicles" ON vehicles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own vehicles" ON vehicles;
CREATE POLICY "Users can delete their own vehicles" ON vehicles FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- VEHICLE_MILEAGE_LOGS
DROP POLICY IF EXISTS "Users can view their own mileage logs" ON vehicle_mileage_logs;
CREATE POLICY "Users can view their own mileage logs" ON vehicle_mileage_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own mileage logs" ON vehicle_mileage_logs;
CREATE POLICY "Users can insert their own mileage logs" ON vehicle_mileage_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own mileage logs" ON vehicle_mileage_logs;
CREATE POLICY "Users can update their own mileage logs" ON vehicle_mileage_logs FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own mileage logs" ON vehicle_mileage_logs;
CREATE POLICY "Users can delete their own mileage logs" ON vehicle_mileage_logs FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- ODOMETER_PHOTOS
DROP POLICY IF EXISTS "Users can view their own odometer photos" ON odometer_photos;
CREATE POLICY "Users can view their own odometer photos" ON odometer_photos FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own odometer photos" ON odometer_photos;
CREATE POLICY "Users can insert their own odometer photos" ON odometer_photos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own odometer photos" ON odometer_photos;
CREATE POLICY "Users can update their own odometer photos" ON odometer_photos FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own odometer photos" ON odometer_photos;
CREATE POLICY "Users can delete their own odometer photos" ON odometer_photos FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- ASSETS
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
CREATE POLICY "Users can view their own assets" ON assets FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
CREATE POLICY "Users can insert their own assets" ON assets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
CREATE POLICY "Users can update their own assets" ON assets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;
CREATE POLICY "Users can delete their own assets" ON assets FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- ASSET_CCA_HISTORY
DROP POLICY IF EXISTS "Users can view their own asset CCA history" ON asset_cca_history;
CREATE POLICY "Users can view their own asset CCA history" ON asset_cca_history FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own asset CCA history" ON asset_cca_history;
CREATE POLICY "Users can insert their own asset CCA history" ON asset_cca_history FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own asset CCA history" ON asset_cca_history;
CREATE POLICY "Users can update their own asset CCA history" ON asset_cca_history FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own asset CCA history" ON asset_cca_history;
CREATE POLICY "Users can delete their own asset CCA history" ON asset_cca_history FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- LEASE_CONTRACTS
DROP POLICY IF EXISTS "Users can view their own lease contracts" ON lease_contracts;
CREATE POLICY "Users can view their own lease contracts" ON lease_contracts FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own lease contracts" ON lease_contracts;
CREATE POLICY "Users can insert their own lease contracts" ON lease_contracts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own lease contracts" ON lease_contracts;
CREATE POLICY "Users can update their own lease contracts" ON lease_contracts FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own lease contracts" ON lease_contracts;
CREATE POLICY "Users can delete their own lease contracts" ON lease_contracts FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- LEASE_PAYMENTS
DROP POLICY IF EXISTS "Users can view their own lease payments" ON lease_payments;
CREATE POLICY "Users can view their own lease payments" ON lease_payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own lease payments" ON lease_payments;
CREATE POLICY "Users can insert their own lease payments" ON lease_payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own lease payments" ON lease_payments;
CREATE POLICY "Users can update their own lease payments" ON lease_payments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own lease payments" ON lease_payments;
CREATE POLICY "Users can delete their own lease payments" ON lease_payments FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- RECEIPTS
DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
CREATE POLICY "Users can view their own receipts" ON receipts FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;
CREATE POLICY "Users can insert their own receipts" ON receipts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own receipts" ON receipts;
CREATE POLICY "Users can update their own receipts" ON receipts FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own receipts" ON receipts;
CREATE POLICY "Users can delete their own receipts" ON receipts FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

-- PAYSTUBS
DROP POLICY IF EXISTS "Users can view their own paystubs" ON paystubs;
CREATE POLICY "Users can view their own paystubs" ON paystubs FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can insert their own paystubs" ON paystubs;
CREATE POLICY "Users can insert their own paystubs" ON paystubs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own paystubs" ON paystubs;
CREATE POLICY "Users can update their own paystubs" ON paystubs FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL))
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own paystubs" ON paystubs;
CREATE POLICY "Users can delete their own paystubs" ON paystubs FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.disclaimer_accepted_at IS NOT NULL));
