-- Full initial schema for remote Supabase (CrewBooks) Prod and dev
-- Generated from Drizzle schema. Includes all app tables + RLS + storage policies.

-- Enable UUID extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  tax_filing_status TEXT DEFAULT 'personal_only',
  province TEXT DEFAULT 'BC',
  subscription_tier TEXT DEFAULT 'basic',
  user_type TEXT,
  union_affiliations JSONB,
  has_agent BOOLEAN DEFAULT false,
  agent_name TEXT,
  agent_commission NUMERIC(5, 2),
  has_business_number BOOLEAN DEFAULT false,
  business_number TEXT,
  has_gst_number BOOLEAN DEFAULT false,
  gst_number TEXT,
  uses_personal_vehicle BOOLEAN DEFAULT false,
  uses_corporate_vehicle BOOLEAN DEFAULT false,
  has_regular_employment BOOLEAN DEFAULT false,
  has_home_office BOOLEAN DEFAULT false,
  home_office_percentage NUMERIC(5, 2),
  enabled_expense_categories JSONB,
  mileage_logging_style TEXT DEFAULT 'trip_distance',
  track_personal_expenses BOOLEAN DEFAULT true,
  ubcp_actra_status TEXT DEFAULT 'none' CHECK (ubcp_actra_status IN ('none', 'background', 'apprentice', 'full_member')),
  ocr_requests_this_month INTEGER DEFAULT 0,
  last_ocr_reset TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- INCOME
-- ============================================
CREATE TABLE IF NOT EXISTS income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  income_type TEXT NOT NULL,
  income_category TEXT,
  gross_pay NUMERIC(12, 2),
  production_name TEXT,
  accounting_office TEXT,
  employer_name TEXT,
  business_name TEXT,
  description TEXT,
  paystub_image_url TEXT,
  gst_hst_collected NUMERIC(12, 2) DEFAULT '0',
  cpp_contribution NUMERIC(12, 2) DEFAULT '0',
  ei_contribution NUMERIC(12, 2) DEFAULT '0',
  income_tax_deduction NUMERIC(12, 2) DEFAULT '0',
  dues NUMERIC(12, 2) DEFAULT '0',
  retirement NUMERIC(12, 2) DEFAULT '0',
  pension NUMERIC(12, 2) DEFAULT '0',
  insurance NUMERIC(12, 2) DEFAULT '0',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- VEHICLES
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  license_plate TEXT,
  is_primary BOOLEAN DEFAULT false,
  used_exclusively_for_business BOOLEAN DEFAULT false,
  claims_cca BOOLEAN DEFAULT false,
  cca_class TEXT,
  current_mileage INTEGER,
  mileage_at_beginning_of_year INTEGER,
  total_annual_mileage INTEGER,
  estimated_yearly_mileage INTEGER,
  mileage_estimate BOOLEAN DEFAULT false,
  purchased_this_year BOOLEAN DEFAULT false,
  purchase_price NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  description TEXT,
  vendor TEXT,
  receipt_image_url TEXT,
  is_tax_deductible BOOLEAN DEFAULT true,
  base_cost NUMERIC(12, 2),
  gst_amount NUMERIC(12, 2) DEFAULT '0',
  pst_amount NUMERIC(12, 2) DEFAULT '0',
  expense_type TEXT NOT NULL,
  business_use_percentage NUMERIC(5, 2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- VEHICLE_MILEAGE_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_mileage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  odometer_reading INTEGER,
  trip_distance INTEGER,
  description TEXT,
  is_business_use BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- ODOMETER_PHOTOS
-- ============================================
CREATE TABLE IF NOT EXISTS odometer_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL,
  mileage INTEGER,
  notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- ASSETS
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(12, 2) NOT NULL,
  purchase_gst NUMERIC(12, 2) DEFAULT '0',
  purchase_pst NUMERIC(12, 2) DEFAULT '0',
  cca_class TEXT NOT NULL,
  business_use_percentage NUMERIC(5, 2) DEFAULT 100,
  apply_half_year_rule BOOLEAN DEFAULT true,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  disposal_date DATE,
  disposal_proceeds NUMERIC(12, 2),
  disposal_gst NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- ASSET_CCA_HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS asset_cca_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  opening_ucc NUMERIC(12, 2) NOT NULL,
  additions NUMERIC(12, 2) DEFAULT '0',
  dispositions NUMERIC(12, 2) DEFAULT '0',
  cca_claimed NUMERIC(12, 2) DEFAULT '0',
  closing_ucc NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- LEASE_CONTRACTS
-- ============================================
CREATE TABLE IF NOT EXISTS lease_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lease_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  lessor_name TEXT,
  lease_start_date DATE NOT NULL,
  lease_end_date DATE NOT NULL,
  monthly_payment NUMERIC(12, 2) NOT NULL,
  payment_frequency TEXT DEFAULT 'monthly',
  business_use_percentage NUMERIC(5, 2) DEFAULT 100,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  asset_category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- LEASE_PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS lease_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_contract_id UUID NOT NULL REFERENCES lease_contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  gst_amount NUMERIC(12, 2) DEFAULT '0',
  pst_amount NUMERIC(12, 2) DEFAULT '0',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- RECEIPTS
-- ============================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  linked_expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  linked_income_id UUID REFERENCES income(id) ON DELETE SET NULL,
  notes TEXT,
  ocr_job_id TEXT,
  ocr_status TEXT,
  ocr_result JSONB,
  ocr_processed_at TIMESTAMPTZ
);

-- ============================================
-- PAYSTUBS
-- ============================================
CREATE TABLE IF NOT EXISTS paystubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  linked_income_id UUID REFERENCES income(id) ON DELETE SET NULL,
  notes TEXT,
  ocr_job_id TEXT,
  ocr_status TEXT,
  ocr_result JSONB,
  ocr_processed_at TIMESTAMPTZ
);

-- ============================================
-- RLS: USERS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());

-- ============================================
-- RLS: INCOME
-- ============================================
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own income" ON income FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own income" ON income FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own income" ON income FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own income" ON income FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: EXPENSES
-- ============================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: VEHICLES
-- ============================================
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own vehicles" ON vehicles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own vehicles" ON vehicles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own vehicles" ON vehicles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own vehicles" ON vehicles FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: VEHICLE_MILEAGE_LOGS
-- ============================================
ALTER TABLE vehicle_mileage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mileage logs" ON vehicle_mileage_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own mileage logs" ON vehicle_mileage_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own mileage logs" ON vehicle_mileage_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own mileage logs" ON vehicle_mileage_logs FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: ODOMETER_PHOTOS
-- ============================================
ALTER TABLE odometer_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own odometer photos" ON odometer_photos FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own odometer photos" ON odometer_photos FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own odometer photos" ON odometer_photos FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own odometer photos" ON odometer_photos FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: ASSETS
-- ============================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own assets" ON assets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own assets" ON assets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own assets" ON assets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own assets" ON assets FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: ASSET_CCA_HISTORY
-- ============================================
ALTER TABLE asset_cca_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own asset CCA history" ON asset_cca_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own asset CCA history" ON asset_cca_history FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own asset CCA history" ON asset_cca_history FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own asset CCA history" ON asset_cca_history FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: LEASE_CONTRACTS
-- ============================================
ALTER TABLE lease_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lease contracts" ON lease_contracts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own lease contracts" ON lease_contracts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own lease contracts" ON lease_contracts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own lease contracts" ON lease_contracts FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: LEASE_PAYMENTS
-- ============================================
ALTER TABLE lease_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lease payments" ON lease_payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own lease payments" ON lease_payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own lease payments" ON lease_payments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own lease payments" ON lease_payments FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: RECEIPTS
-- ============================================
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own receipts" ON receipts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own receipts" ON receipts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own receipts" ON receipts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own receipts" ON receipts FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS: PAYSTUBS
-- ============================================
ALTER TABLE paystubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own paystubs" ON paystubs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own paystubs" ON paystubs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own paystubs" ON paystubs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own paystubs" ON paystubs FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- STORAGE RLS (buckets: receipts, paystubs, odometer-photos)
-- Buckets must be created in Supabase Dashboard or via Storage API.
-- ============================================
DROP POLICY IF EXISTS "Users can upload receipts to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload paystubs to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own paystubs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own paystubs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload odometer photos to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own odometer photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own odometer photos" ON storage.objects;

CREATE POLICY "Users can upload receipts to their own folder" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view their own receipts" ON storage.objects FOR SELECT
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own receipts" ON storage.objects FOR DELETE
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload paystubs to their own folder" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'paystubs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view their own paystubs" ON storage.objects FOR SELECT
USING (bucket_id = 'paystubs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own paystubs" ON storage.objects FOR DELETE
USING (bucket_id = 'paystubs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload odometer photos to their own folder" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'odometer-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view their own odometer photos" ON storage.objects FOR SELECT
USING (bucket_id = 'odometer-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own odometer photos" ON storage.objects FOR DELETE
USING (bucket_id = 'odometer-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
