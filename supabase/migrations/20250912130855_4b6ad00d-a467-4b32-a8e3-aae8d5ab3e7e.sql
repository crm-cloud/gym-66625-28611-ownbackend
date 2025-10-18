-- Update the handle_new_user function to properly handle admin users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
    branch_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::text,
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
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    is_active = EXCLUDED.is_active,
    gym_id = EXCLUDED.gym_id,
    branch_id = EXCLUDED.branch_id;
  
  RETURN NEW;
END;
$function$;

-- Update the update_gym_usage function to handle missing branches table
CREATE OR REPLACE FUNCTION public.update_gym_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if branches table exists before proceeding
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branches' AND table_schema = 'public') THEN
    -- Update current month usage for the gym
    INSERT INTO public.gym_usage (gym_id, month_year, branch_count, trainer_count, member_count)
    VALUES (
      COALESCE(NEW.gym_id, OLD.gym_id),
      DATE_TRUNC('month', CURRENT_DATE)::DATE,
      (SELECT COUNT(*) FROM public.branches WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id)),
      (SELECT COUNT(*) FROM public.profiles WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) AND role IN ('trainer')),
      (SELECT COUNT(*) FROM public.profiles WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) AND role = 'member')
    )
    ON CONFLICT (gym_id, month_year) 
    DO UPDATE SET
      branch_count = (SELECT COUNT(*) FROM public.branches WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id)),
      trainer_count = (SELECT COUNT(*) FROM public.profiles WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) AND role = 'trainer'),
      member_count = (SELECT COUNT(*) FROM public.profiles WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) AND role = 'member');
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;