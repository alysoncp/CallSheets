-- RLS Hardening Migration
-- Fixes security gaps: add WITH CHECK to UPDATE policies, TO authenticated, add Storage UPDATE policies.
-- Apply to dev first, smoke test uploads + CRUD, then push to prod.
-- Note: storage.objects RLS is enabled by Supabase by default; we cannot ALTER it (requires table owner).

-- ============================================
-- 1. TABLE POLICIES: Add WITH CHECK to UPDATE + TO authenticated
-- ============================================

-- USERS (uses id, not user_id)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- INCOME
DROP POLICY IF EXISTS "Users can view their own income" ON income;
CREATE POLICY "Users can view their own income" ON income FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own income" ON income;
CREATE POLICY "Users can insert their own income" ON income FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own income" ON income;
CREATE POLICY "Users can update their own income" ON income FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own income" ON income;
CREATE POLICY "Users can delete their own income" ON income FOR DELETE TO authenticated USING (user_id = auth.uid());

-- EXPENSES
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE TO authenticated USING (user_id = auth.uid());

-- VEHICLES
DROP POLICY IF EXISTS "Users can view their own vehicles" ON vehicles;
CREATE POLICY "Users can view their own vehicles" ON vehicles FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own vehicles" ON vehicles;
CREATE POLICY "Users can insert their own vehicles" ON vehicles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own vehicles" ON vehicles;
CREATE POLICY "Users can update their own vehicles" ON vehicles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own vehicles" ON vehicles;
CREATE POLICY "Users can delete their own vehicles" ON vehicles FOR DELETE TO authenticated USING (user_id = auth.uid());

-- VEHICLE_MILEAGE_LOGS
DROP POLICY IF EXISTS "Users can view their own mileage logs" ON vehicle_mileage_logs;
CREATE POLICY "Users can view their own mileage logs" ON vehicle_mileage_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own mileage logs" ON vehicle_mileage_logs;
CREATE POLICY "Users can insert their own mileage logs" ON vehicle_mileage_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own mileage logs" ON vehicle_mileage_logs;
CREATE POLICY "Users can update their own mileage logs" ON vehicle_mileage_logs FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own mileage logs" ON vehicle_mileage_logs;
CREATE POLICY "Users can delete their own mileage logs" ON vehicle_mileage_logs FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ODOMETER_PHOTOS
DROP POLICY IF EXISTS "Users can view their own odometer photos" ON odometer_photos;
CREATE POLICY "Users can view their own odometer photos" ON odometer_photos FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own odometer photos" ON odometer_photos;
CREATE POLICY "Users can insert their own odometer photos" ON odometer_photos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own odometer photos" ON odometer_photos;
CREATE POLICY "Users can update their own odometer photos" ON odometer_photos FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own odometer photos" ON odometer_photos;
CREATE POLICY "Users can delete their own odometer photos" ON odometer_photos FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ASSETS
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
CREATE POLICY "Users can view their own assets" ON assets FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
CREATE POLICY "Users can insert their own assets" ON assets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
CREATE POLICY "Users can update their own assets" ON assets FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;
CREATE POLICY "Users can delete their own assets" ON assets FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ASSET_CCA_HISTORY
DROP POLICY IF EXISTS "Users can view their own asset CCA history" ON asset_cca_history;
CREATE POLICY "Users can view their own asset CCA history" ON asset_cca_history FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own asset CCA history" ON asset_cca_history;
CREATE POLICY "Users can insert their own asset CCA history" ON asset_cca_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own asset CCA history" ON asset_cca_history;
CREATE POLICY "Users can update their own asset CCA history" ON asset_cca_history FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own asset CCA history" ON asset_cca_history;
CREATE POLICY "Users can delete their own asset CCA history" ON asset_cca_history FOR DELETE TO authenticated USING (user_id = auth.uid());

-- LEASE_CONTRACTS
DROP POLICY IF EXISTS "Users can view their own lease contracts" ON lease_contracts;
CREATE POLICY "Users can view their own lease contracts" ON lease_contracts FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own lease contracts" ON lease_contracts;
CREATE POLICY "Users can insert their own lease contracts" ON lease_contracts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own lease contracts" ON lease_contracts;
CREATE POLICY "Users can update their own lease contracts" ON lease_contracts FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own lease contracts" ON lease_contracts;
CREATE POLICY "Users can delete their own lease contracts" ON lease_contracts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- LEASE_PAYMENTS
DROP POLICY IF EXISTS "Users can view their own lease payments" ON lease_payments;
CREATE POLICY "Users can view their own lease payments" ON lease_payments FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own lease payments" ON lease_payments;
CREATE POLICY "Users can insert their own lease payments" ON lease_payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own lease payments" ON lease_payments;
CREATE POLICY "Users can update their own lease payments" ON lease_payments FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own lease payments" ON lease_payments;
CREATE POLICY "Users can delete their own lease payments" ON lease_payments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RECEIPTS
DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
CREATE POLICY "Users can view their own receipts" ON receipts FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;
CREATE POLICY "Users can insert their own receipts" ON receipts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own receipts" ON receipts;
CREATE POLICY "Users can update their own receipts" ON receipts FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own receipts" ON receipts;
CREATE POLICY "Users can delete their own receipts" ON receipts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- PAYSTUBS
DROP POLICY IF EXISTS "Users can view their own paystubs" ON paystubs;
CREATE POLICY "Users can view their own paystubs" ON paystubs FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own paystubs" ON paystubs;
CREATE POLICY "Users can insert their own paystubs" ON paystubs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own paystubs" ON paystubs;
CREATE POLICY "Users can update their own paystubs" ON paystubs FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own paystubs" ON paystubs;
CREATE POLICY "Users can delete their own paystubs" ON paystubs FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================
-- 2. STORAGE POLICIES: TO authenticated + add UPDATE
-- ============================================

-- Receipts bucket
DROP POLICY IF EXISTS "Users can upload receipts to their own folder" ON storage.objects;
CREATE POLICY "Users can upload receipts to their own folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
CREATE POLICY "Users can view their own receipts" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own receipts" ON storage.objects;
CREATE POLICY "Users can update their own receipts" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
CREATE POLICY "Users can delete their own receipts" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Paystubs bucket
DROP POLICY IF EXISTS "Users can upload paystubs to their own folder" ON storage.objects;
CREATE POLICY "Users can upload paystubs to their own folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'paystubs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view their own paystubs" ON storage.objects;
CREATE POLICY "Users can view their own paystubs" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'paystubs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own paystubs" ON storage.objects;
CREATE POLICY "Users can update their own paystubs" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'paystubs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'paystubs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own paystubs" ON storage.objects;
CREATE POLICY "Users can delete their own paystubs" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'paystubs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Odometer-photos bucket (ready for future upload implementation)
DROP POLICY IF EXISTS "Users can upload odometer photos to their own folder" ON storage.objects;
CREATE POLICY "Users can upload odometer photos to their own folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'odometer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view their own odometer photos" ON storage.objects;
CREATE POLICY "Users can view their own odometer photos" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'odometer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own odometer photos" ON storage.objects;
CREATE POLICY "Users can update their own odometer photos" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'odometer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'odometer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own odometer photos" ON storage.objects;
CREATE POLICY "Users can delete their own odometer photos" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'odometer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
