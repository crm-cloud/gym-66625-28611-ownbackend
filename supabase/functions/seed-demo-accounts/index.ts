import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoUser {
  email: string;
  password: string;
  role: string;
  teamRole?: string;
  branchIndex: number; // 0 or 1 for Branch A or B
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🌱 Starting demo account seeding...');

    // Step 1: Create or get Demo Gym
    const { data: existingGym, error: gymCheckError } = await supabase
      .from('gyms')
      .select('id')
      .eq('name', 'Demo Gym')
      .maybeSingle();

    let gymId: string;
    
    if (existingGym) {
      gymId = existingGym.id;
      console.log('✅ Using existing Demo Gym:', gymId);
    } else {
      const { data: newGym, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name: 'Demo Gym',
          subscription_plan: 'pro',
          status: 'active',
          max_branches: 10,
          max_trainers: 50,
          max_members: 500,
        })
        .select()
        .single();

      if (gymError) throw gymError;
      gymId = newGym.id;
      console.log('✅ Created Demo Gym:', gymId);
    }

    // Step 2: Create or get Demo Branches
    const branchNames = ['Downtown Branch', 'Uptown Branch'];
    const branchIds: string[] = [];

    for (const branchName of branchNames) {
      const { data: existingBranch, error: branchCheckError } = await supabase
        .from('branches')
        .select('id')
        .eq('name', branchName)
        .eq('gym_id', gymId)
        .maybeSingle();

      if (existingBranch) {
        branchIds.push(existingBranch.id);
        console.log(`✅ Using existing ${branchName}:`, existingBranch.id);
      } else {
        const { data: newBranch, error: branchError } = await supabase
          .from('branches')
          .insert({
            gym_id: gymId,
            name: branchName,
            status: 'active',
            capacity: 200,
            current_members: 0,
            address: {
              street: '123 Demo Street',
              city: 'Demo City',
              state: 'DC',
              zip: '12345',
              country: 'USA'
            },
            contact: {
              email: `${branchName.toLowerCase().replace(' ', '.')}@demo.gym`,
              phone: '+1234567890'
            },
            hours: {
              monday: '6:00 AM - 10:00 PM',
              tuesday: '6:00 AM - 10:00 PM',
              wednesday: '6:00 AM - 10:00 PM',
              thursday: '6:00 AM - 10:00 PM',
              friday: '6:00 AM - 10:00 PM',
              saturday: '8:00 AM - 8:00 PM',
              sunday: '8:00 AM - 8:00 PM'
            }
          })
          .select()
          .single();

        if (branchError) throw branchError;
        branchIds.push(newBranch.id);
        console.log(`✅ Created ${branchName}:`, newBranch.id);
      }
    }

    // Step 3: Define demo users
    const demoUsers: DemoUser[] = [
      // Managers (2) - one per branch
      { email: 'manager01@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'manager', branchIndex: 0 },
      { email: 'manager02@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'manager', branchIndex: 1 },
      
      // Trainers (10) - 5 per branch
      { email: 'trainer01@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 0 },
      { email: 'trainer02@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 0 },
      { email: 'trainer03@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 0 },
      { email: 'trainer04@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 0 },
      { email: 'trainer05@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 0 },
      { email: 'trainer06@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 1 },
      { email: 'trainer07@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 1 },
      { email: 'trainer08@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 1 },
      { email: 'trainer09@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 1 },
      { email: 'trainer10@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'trainer', branchIndex: 1 },
      
      // Staff (5) - 3 in branch A, 2 in branch B
      { email: 'staff01@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'staff', branchIndex: 0 },
      { email: 'staff02@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'staff', branchIndex: 0 },
      { email: 'staff03@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'staff', branchIndex: 0 },
      { email: 'staff04@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'staff', branchIndex: 1 },
      { email: 'staff05@demo.gym', password: 'Demo@12345', role: 'team', teamRole: 'staff', branchIndex: 1 },
      
      // Members (5) - 3 in branch A, 2 in branch B
      { email: 'member01@demo.gym', password: 'Demo@12345', role: 'member', branchIndex: 0 },
      { email: 'member02@demo.gym', password: 'Demo@12345', role: 'member', branchIndex: 0 },
      { email: 'member03@demo.gym', password: 'Demo@12345', role: 'member', branchIndex: 0 },
      { email: 'member04@demo.gym', password: 'Demo@12345', role: 'member', branchIndex: 1 },
      { email: 'member05@demo.gym', password: 'Demo@12345', role: 'member', branchIndex: 1 },
    ];

    // Step 4: Create users and assign roles
    const results = [];
    
    for (const user of demoUsers) {
      try {
        const branchId = branchIds[user.branchIndex];
        
        // Check if user already exists
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const userExists = existingUser?.users?.some(u => u.email === user.email);
        
        let userId: string;
        
        if (userExists) {
          const existing = existingUser?.users?.find(u => u.email === user.email);
          userId = existing!.id;
          console.log(`⏭️ User already exists: ${user.email}`);
        } else {
          // Create auth user
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              role: user.role,
              team_role: user.teamRole,
              gym_id: gymId,
              branch_id: branchId,
              full_name: user.email.split('@')[0].replace(/\d+/, ' ').trim(),
            }
          });

          if (authError) {
            console.error(`❌ Failed to create user ${user.email}:`, authError);
            continue;
          }

          userId = authUser.user.id;
          console.log(`✅ Created user: ${user.email}`);
        }

        // Insert into user_roles (only columns that exist)
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: user.role,
            team_role: user.teamRole,
            branch_id: branchId,
          })
          .select()
          .single();

        if (roleError && roleError.code !== '23505') { // Ignore duplicate key errors
          console.error(`❌ Failed to assign role for ${user.email}:`, roleError);
        } else {
          console.log(`✅ Assigned role for: ${user.email}`);
        }

        results.push({
          email: user.email,
          userId,
          role: user.role,
          teamRole: user.teamRole,
          branch: branchNames[user.branchIndex],
          success: true
        });

      } catch (err) {
        console.error(`❌ Error processing ${user.email}:`, err);
        results.push({
          email: user.email,
          success: false,
          error: err.message
        });
      }
    }

    // Step 5: Optional - Create sample lockers
    for (let i = 0; i < branchIds.length; i++) {
      const branchId = branchIds[i];
      
      // Create 10 lockers per branch
      const lockers = Array.from({ length: 10 }, (_, index) => ({
        branch_id: branchId,
        number: `${i + 1}${String(index + 1).padStart(2, '0')}`,
        name: `Locker ${i + 1}${String(index + 1).padStart(2, '0')}`,
        status: 'available',
        monthly_fee: 10.00
      }));

      const { error: lockerError } = await supabase
        .from('lockers')
        .upsert(lockers, { onConflict: 'branch_id,number', ignoreDuplicates: true });

      if (lockerError) {
        console.error(`⚠️ Failed to create lockers for branch ${i + 1}:`, lockerError);
      } else {
        console.log(`✅ Created 10 lockers for ${branchNames[i]}`);
      }
    }

    console.log('🎉 Demo account seeding completed!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo accounts seeded successfully',
        gym: { id: gymId, name: 'Demo Gym' },
        branches: branchIds.map((id, i) => ({ id, name: branchNames[i] })),
        users: results,
        summary: {
          total: demoUsers.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});