-- Fix the handle_new_user function to properly cast role to user_role enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    role, 
    phone, 
    date_of_birth, 
    is_active,
    gym_id,
    branch_id,
    address
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::user_role,
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
      ELSE NULL 
    END,
    COALESCE((NEW.raw_user_meta_data->>'is_active')::boolean, true),
    CASE 
      WHEN NEW.raw_user_meta_data->>'gym_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'gym_id')::uuid 
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'branch_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'branch_id')::uuid 
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->'address' IS NOT NULL 
      THEN NEW.raw_user_meta_data->'address'
      ELSE NULL 
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    is_active = EXCLUDED.is_active,
    gym_id = EXCLUDED.gym_id,
    branch_id = EXCLUDED.branch_id,
    address = EXCLUDED.address;
  
  RETURN NEW;
END;
$function$;

-- Ensure the auth trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;