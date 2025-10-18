import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        ...corsHeaders, 
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
      }, 
      status: 204 
    })
  }

  try {
    // Create Supabase client with SERVICE ROLE key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validate caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      console.error('Auth validation error:', userError)
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if caller is super-admin
    const { data: roles, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super-admin')
      .maybeSingle()

    if (roleCheckError) {
      console.error('Role check error:', roleCheckError)
    }

    if (!roles) {
      console.error('Unauthorized: User', user.id, 'is not a super-admin')
      return new Response(JSON.stringify({ error: 'Unauthorized: Only super-admins can create admins' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const { 
      email, 
      password, 
      full_name, 
      phone, 
      gym_name, 
      subscription_plan, 
      date_of_birth, 
      address,
      existing_gym_id,
      existing_branch_id
    } = await req.json()

    console.log('Creating admin atomically for email:', email, existing_gym_id ? '(existing gym)' : '(new gym)')

    // Call the atomic database function
    const { data: result, error: dbError } = await supabaseAdmin.rpc('create_gym_admin_atomic', {
      p_email: email,
      p_password: password,
      p_full_name: full_name,
      p_phone: phone || null,
      p_gym_name: gym_name || `${full_name}'s Gym`,
      p_subscription_plan: subscription_plan || 'basic',
      p_address: address || null,
      p_date_of_birth: date_of_birth || null,
      p_existing_gym_id: existing_gym_id || null,
      p_existing_branch_id: existing_branch_id || null,
    })

    if (dbError) {
      console.error('Database function error:', dbError)
      return new Response(JSON.stringify({ 
        success: false,
        error: dbError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!result || !result.success) {
      console.error('Admin creation failed:', result?.error)
      return new Response(JSON.stringify({ 
        success: false,
        error: result?.error || 'Unknown error' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Admin created successfully:', result.user_id)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
