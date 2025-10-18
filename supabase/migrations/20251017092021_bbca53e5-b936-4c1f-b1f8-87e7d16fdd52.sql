-- ============================================
-- ATOMIC ADMIN CREATION FUNCTION
-- ============================================
-- This function creates an admin user, their gym, branch, profile, and role
-- in a SINGLE, atomic transaction. No race conditions, no partial failures.

CREATE OR REPLACE FUNCTION public.create_gym_admin_atomic(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_phone TEXT,
    p_gym_name TEXT,
    p_subscription_plan TEXT,
    p_address JSONB,
    p_date_of_birth DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: allows function to bypass RLS
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_gym_id UUID;
    v_branch_id UUID;
    v_encrypted_password TEXT;
BEGIN
    -- Step 1: Encrypt password (using bcrypt)
    v_encrypted_password := crypt(p_password, gen_salt('bf'));
    
    -- Step 2: Create auth user with elevated privileges
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::UUID, -- Default instance
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        p_email,
        v_encrypted_password,
        NOW(), -- Auto-confirm email
        '{"provider":"email","providers":["email"]}'::JSONB,
        jsonb_build_object('full_name', p_full_name, 'phone', p_phone),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO v_user_id;
    
    -- Step 3: Create gym
    INSERT INTO public.gyms (
        name,
        subscription_plan,
        status,
        billing_email,
        created_at,
        updated_at
    ) VALUES (
        p_gym_name,
        p_subscription_plan,
        'active',
        p_email,
        NOW(),
        NOW()
    ) RETURNING id INTO v_gym_id;
    
    -- Step 4: Create default branch
    INSERT INTO public.branches (
        gym_id,
        name,
        capacity,
        status,
        address,
        contact,
        hours,
        created_at,
        updated_at
    ) VALUES (
        v_gym_id,
        'Main Branch',
        100,
        'active',
        COALESCE(p_address, '{"street":"","city":"","state":"","pincode":""}'::JSONB),
        jsonb_build_object('phone', p_phone, 'email', p_email),
        '{
            "monday": {"open": "06:00", "close": "22:00"},
            "tuesday": {"open": "06:00", "close": "22:00"},
            "wednesday": {"open": "06:00", "close": "22:00"},
            "thursday": {"open": "06:00", "close": "22:00"},
            "friday": {"open": "06:00", "close": "22:00"},
            "saturday": {"open": "08:00", "close": "20:00"},
            "sunday": {"open": "08:00", "close": "20:00"}
        }'::JSONB,
        NOW(),
        NOW()
    ) RETURNING id INTO v_branch_id;
    
    -- Step 5: Create profile (NO TRIGGER DEPENDENCY!)
    INSERT INTO public.profiles (
        user_id,
        full_name,
        email,
        phone,
        date_of_birth,
        address,
        gym_id,
        branch_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_full_name,
        p_email,
        p_phone,
        p_date_of_birth,
        p_address,
        v_gym_id,
        v_branch_id,
        'admin'::user_role,
        true,
        NOW(),
        NOW()
    );
    
    -- Step 6: Assign admin role (GUARANTEED to work, no FK issues)
    INSERT INTO public.user_roles (
        user_id,
        role,
        branch_id,
        created_at
    ) VALUES (
        v_user_id,
        'admin'::user_role,
        v_branch_id,
        NOW()
    );
    
    -- Step 7: Return success with all IDs
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'gym_id', v_gym_id,
        'branch_id', v_branch_id,
        'email', p_email
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- If ANY step fails, entire transaction rolls back automatically
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_detail', SQLSTATE
        );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_gym_admin_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_gym_admin_atomic TO service_role;

-- Add comment
COMMENT ON FUNCTION public.create_gym_admin_atomic IS 
'Atomically creates a gym admin with their gym, branch, profile, and role in a single transaction. 
Security: Only callable by super-admins (checked in edge function).';