import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateTrainerRequest {
  full_name: string;
  email: string;
  phone: string;
  branch_id: string;
  specialties?: string[];
  is_active?: boolean;
  profile_photo?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { full_name, email, phone, branch_id, specialties, is_active, profile_photo }: CreateTrainerRequest = await req.json();
    
    console.log('Creating trainer account:', { full_name, email, branch_id });

    // Generate temporary password
    const tempPassword = 'Trainer' + Math.random().toString(36).slice(-8) + '!';

    // Get the branch details to extract gym_id
    const { data: branchData, error: branchError } = await supabase
      .from('branches')
      .select('gym_id')
      .eq('id', branch_id)
      .single();

    if (branchError) {
      console.error('Branch lookup error:', branchError);
      throw new Error('Invalid branch ID');
    }

    // Create auth user with service role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: 'trainer',
        phone,
        gym_id: branchData.gym_id,
        branch_id,
        is_active: is_active ?? true,
        specialties: specialties || [],
        profile_photo: profile_photo || null
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log('Trainer user created successfully:', authData.user.id);
    
    // The database trigger will automatically create the profile
    console.log('Profile will be created automatically by database trigger');

    return new Response(JSON.stringify({ 
      success: true, 
      userId: authData.user.id,
      tempPassword: tempPassword,
      message: 'Trainer account created successfully.'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in create-trainer-account function:', error);
    const status = error?.status || (error?.code === 'email_exists' ? 422 : 500);
    const message = error?.code === 'email_exists'
      ? 'A user with this email address has already been registered'
      : (error?.message || 'Failed to create trainer account');

    return new Response(
      JSON.stringify({ 
        error: message,
        code: error?.code || null,
        details: error?.details || null 
      }),
      {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});