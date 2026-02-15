-- Create public.users row when a new auth user is created (sign-up).
-- Ensures both Auth user and user table entry exist at sign-up so disclaimer
-- accepted at sign-up is respected and the user never sees the disclaimer twice.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_tier TEXT;
  tax_status TEXT;
  disc_version TEXT;
  disc_at TIMESTAMPTZ;
BEGIN
  sub_tier := COALESCE(NEW.raw_user_meta_data->>'subscriptionTier', 'personal');
  tax_status := CASE WHEN (NEW.raw_user_meta_data->>'subscriptionTier') = 'corporate' THEN 'personal_and_corporate' ELSE 'personal_only' END;
  disc_version := NEW.raw_user_meta_data->>'disclaimer_version';
  disc_at := (NEW.raw_user_meta_data->>'disclaimer_accepted_at')::timestamptz;

  INSERT INTO public.users (
    id,
    email,
    subscription_tier,
    tax_filing_status,
    province,
    disclaimer_version,
    disclaimer_accepted_at
  ) VALUES (
    NEW.id,
    NEW.email,
    sub_tier,
    tax_status,
    'BC',
    disc_version,
    disc_at
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_auth_user();
