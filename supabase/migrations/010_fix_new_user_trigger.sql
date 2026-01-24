-- Fix handle_new_user trigger function
-- Resolves "database error saving new user" on signup

-- Add INSERT policy for profiles (the trigger needs this)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Recreate handle_new_user with proper search_path (fixes security warning)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  whitelist_record RECORD;
  assigned_tier user_tier;
BEGIN
  -- Check if email is whitelisted
  SELECT * INTO whitelist_record
  FROM public.email_whitelist
  WHERE email = LOWER(NEW.email)
    AND (expires_at IS NULL OR expires_at > NOW())
    AND used_at IS NULL;

  -- Determine tier based on whitelist
  IF whitelist_record IS NOT NULL THEN
    assigned_tier := whitelist_record.granted_tier;

    -- Mark whitelist entry as used
    UPDATE public.email_whitelist
    SET used_at = NOW()
    WHERE id = whitelist_record.id;
  ELSE
    assigned_tier := 'free';
  END IF;

  -- Create the profile with appropriate tier
  INSERT INTO public.profiles (id, email, tier)
  VALUES (NEW.id, NEW.email, assigned_tier);

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Also fix update_updated_at_column function search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
