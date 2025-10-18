import bcrypt from 'bcryptjs';
import prisma from '../config/database';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create Demo Gym
    const gym = await prisma.gyms.upsert({
      where: { id: 'demo-gym-id' },
      update: {},
      create: {
        id: 'demo-gym-id',
        name: 'FitVerse Demo Gym',
        subscription_plan: 'pro',
        status: 'active',
        max_branches: 10,
        max_trainers: 50,
        max_members: 500,
      }
    });
    console.log('✅ Gym created');

    // Create Branches
    const branch1 = await prisma.branches.create({
      data: {
        gym_id: gym.id,
        name: 'Downtown Branch',
        status: 'active',
        capacity: 200,
        current_members: 0,
        address: { street: '123 Main St', city: 'City', state: 'ST', zip: '12345' },
        contact: { email: 'downtown@fitverse.com', phone: '+1234567890' },
      }
    });

    const branch2 = await prisma.branches.create({
      data: {
        gym_id: gym.id,
        name: 'Uptown Branch',
        status: 'active',
        capacity: 200,
        current_members: 0,
        address: { street: '456 High St', city: 'City', state: 'ST', zip: '12346' },
        contact: { email: 'uptown@fitverse.com', phone: '+1234567891' },
      }
    });
    console.log('✅ Branches created');

    // Create Super Admin
    const superAdminHash = await bcrypt.hash('SuperAdmin@123', 10);
    const superAdmin = await prisma.profiles.create({
      data: {
        email: 'superadmin@fitverse.com',
        full_name: 'Super Admin',
        password_hash: superAdminHash,
        email_verified: true,
        is_active: true,
      }
    });
    await prisma.user_roles.create({
      data: { user_id: superAdmin.user_id, role: 'super_admin' }
    });

    // Create Admin
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.profiles.create({
      data: {
        email: 'admin@fitverse.com',
        full_name: 'Admin User',
        password_hash: adminHash,
        email_verified: true,
        is_active: true,
      }
    });
    await prisma.user_roles.create({
      data: { user_id: admin.user_id, role: 'admin', gym_id: gym.id }
    });
    console.log('✅ Admin users created');

    // Create Trainers, Members, Staff
    const trainerHash = await bcrypt.hash('Trainer@123', 10);
    const memberHash = await bcrypt.hash('Member@123', 10);
    const staffHash = await bcrypt.hash('Staff@123', 10);

    // 5 Trainers
    for (let i = 1; i <= 5; i++) {
      const trainer = await prisma.profiles.create({
        data: {
          email: `trainer${String(i).padStart(2, '0')}@fitverse.com`,
          full_name: `Trainer ${i}`,
          password_hash: trainerHash,
          email_verified: true,
          is_active: true,
        }
      });
      const branchId = i <= 3 ? branch1.id : branch2.id;
      await prisma.user_roles.create({
        data: { user_id: trainer.user_id, role: 'team', team_role: 'trainer', branch_id: branchId }
      });
      await prisma.trainer_profiles.create({
        data: {
          user_id: trainer.user_id,
          branch_id: branchId,
          name: `Trainer ${i}`,
          is_active: true,
        }
      });
    }
    console.log('✅ Trainers created');

    // 10 Members
    for (let i = 1; i <= 10; i++) {
      const member = await prisma.profiles.create({
        data: {
          email: `member${String(i).padStart(2, '0')}@fitverse.com`,
          full_name: `Member ${i}`,
          password_hash: memberHash,
          email_verified: true,
          is_active: true,
        }
      });
      const branchId = i <= 5 ? branch1.id : branch2.id;
      await prisma.user_roles.create({
        data: { user_id: member.user_id, role: 'member', branch_id: branchId }
      });
      await prisma.members.create({
        data: {
          user_id: member.user_id,
          branch_id: branchId,
          member_number: `MEM${String(i).padStart(4, '0')}`,
          first_name: `Member`,
          last_name: `${i}`,
          email: `member${String(i).padStart(2, '0')}@fitverse.com`,
          status: 'active',
        }
      });
    }
    console.log('✅ Members created');

    // 2 Staff
    for (let i = 1; i <= 2; i++) {
      const staff = await prisma.profiles.create({
        data: {
          email: `staff${String(i).padStart(2, '0')}@fitverse.com`,
          full_name: `Staff ${i}`,
          password_hash: staffHash,
          email_verified: true,
          is_active: true,
        }
      });
      const branchId = i === 1 ? branch1.id : branch2.id;
      await prisma.user_roles.create({
        data: { user_id: staff.user_id, role: 'team', team_role: 'staff', branch_id: branchId }
      });
    }
    console.log('✅ Staff created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📧 Test Credentials:');
    console.log('Super Admin: superadmin@fitverse.com / SuperAdmin@123');
    console.log('Admin: admin@fitverse.com / Admin@123');
    console.log('Trainers: trainer01-05@fitverse.com / Trainer@123');
    console.log('Members: member01-10@fitverse.com / Member@123');
    console.log('Staff: staff01-02@fitverse.com / Staff@123\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
