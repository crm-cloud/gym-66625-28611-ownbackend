import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

export interface CreateUserParams {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  gym_id?: string;
  branch_id?: string;
  date_of_birth?: Date;
  address?: Record<string, any>;
}

export interface CreateUserResult {
  user: any;
  profile: any;
  error?: any;
}

/**
 * @deprecated SECURITY WARNING: This function has critical security flaws.
 * 
 * Issues:
 * - Client-side role assignment (vulnerable to privilege escalation)
 * - Race conditions with auth.users and profile creation
 * - Unreliable setTimeout polling
 * 
 * Use secure edge functions instead:
 * - create-admin-user (for admins)
 * - create-trainer-account (for trainers)
 * 
 * DO NOT USE for admin/privileged role creation.
 * Only use for non-privileged roles like 'member' or 'staff' if absolutely necessary.
 */
export const createUserWithRole = async (params: CreateUserParams): Promise<CreateUserResult> => {
  const { 
    email, 
    password, 
    full_name, 
    phone, 
    role, 
    gym_id, 
    branch_id,
    date_of_birth,
    address 
  } = params;

  try {
    // Step 1: Create auth user with standard signUp (no admin privileges needed)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name, phone }
      }
    });

    // If user already exists, link and assign role instead of failing
    if (authError) {
      const msg = String(authError.message || '');
      if (authError.code === 'user_already_exists' || msg.toLowerCase().includes('already')) {
        // Try to find existing profile by email
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (!existingProfile?.user_id) {
          return { user: null, profile: null, error: new Error('User already exists but profile not found. Ask user to login once, then retry.') };
        }

        // Assign role if missing (idempotent)
        const assignRole = async () => {
          const { data: hasRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', existingProfile.user_id)
            .eq('role', role)
            .maybeSingle();
          if (!hasRole) {
            await supabase
              .from('user_roles')
              .upsert({ user_id: existingProfile.user_id, role, branch_id: branch_id || null }, { onConflict: 'user_id,role', ignoreDuplicates: true });
          }
        };
        await assignRole();

        // Update profile with gym/branch
        await supabase
          .from('profiles')
          .update({
            gym_id: gym_id || null,
            branch_id: branch_id || null,
            phone: phone || null,
            date_of_birth: date_of_birth ? date_of_birth.toISOString().split('T')[0] : null,
            address: address || null,
            is_active: true,
          })
          .eq('user_id', existingProfile.user_id);

        return { user: { id: existingProfile.user_id, email }, profile: existingProfile, error: null };
      }
      return { user: null, profile: null, error: authError };
    }

    // For new users, wait for profile to be created via trigger
    const newUserId = authData.user.id;
    let attempts = 0;
    let profileRow: any = null;
    while (attempts < 10 && !profileRow) {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', newUserId)
        .maybeSingle();
      if (p) { profileRow = p; break; }
      attempts++;
      await new Promise(r => setTimeout(r, 500));
    }

    // Try to assign role with retries to avoid FK timing issues
    let roleAssigned = false;
    for (let i = 0; i < 10 && !roleAssigned; i++) {
      const { error: roleErr } = await supabase
        .from('user_roles')
        .upsert({ user_id: newUserId, role, branch_id: branch_id || null }, { onConflict: 'user_id,role', ignoreDuplicates: true });
      if (!roleErr) { roleAssigned = true; break; }
      await new Promise(r => setTimeout(r, 500));
    }

    if (!roleAssigned) {
      return { user: authData.user, profile: profileRow, error: new Error('Could not assign role. Please retry shortly.') };
    }
    // Step 4: Update profile with additional information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        gym_id: gym_id || null,
        branch_id: branch_id || null,
        phone: phone || null,
        date_of_birth: date_of_birth ? date_of_birth.toISOString().split('T')[0] : null,
        address: address || null,
        is_active: true,
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail completely, user is created
    }

    // Step 5: Fetch the updated profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (fetchError) {
      console.error('Profile fetch error:', fetchError);
    }

    return {
      user: authData.user,
      profile: profile,
      error: null
    };

  } catch (error) {
    console.error('User creation error:', error);
    return {
      user: null,
      profile: null,
      error
    };
  }
};

/**
 * Generate a temporary password for new users
 */
export const generateTempPassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Enable login capability for existing members - Phase 5
 * Creates auth user and links to member record
 */
export const enableMemberLogin = async (
  memberId: string, 
  email: string, 
  full_name: string,
  password: string,
  branch_id?: string
): Promise<CreateUserResult> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/member/dashboard`,
        data: {
          full_name,
        }
      }
    });

    if (authError) {
      return { user: null, profile: null, error: authError };
    }

    if (!authData.user) {
      return { 
        user: null, 
        profile: null, 
        error: new Error('User creation failed') 
      };
    }

    // Wait for profile creation trigger
    await new Promise(resolve => setTimeout(resolve, 500));

    // Link auth user to member record
    const { error: memberError } = await supabase
      .from('members')
      .update({ user_id: authData.user.id })
      .eq('id', memberId);

    if (memberError) {
      console.error('Member link error:', memberError);
      return { user: authData.user, profile: null, error: memberError };
    }

    // Assign member role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'member',
        branch_id: branch_id || null,
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      return { user: authData.user, profile: null, error: roleError };
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        branch_id: branch_id || null,
        is_active: true,
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    return {
      user: authData.user,
      profile: null,
      error: null
    };

  } catch (error) {
    console.error('Member login enable error:', error);
    return {
      user: null,
      profile: null,
      error
    };
  }
};
