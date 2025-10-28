// scripts/verify-super-admin.ts
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../src/utils/crypto-utils';

const prisma = new PrismaClient();

async function verifySuperAdmin() {
  try {
    const email = 'superadmin@example.com';
    const testPassword = 'SuperAdmin@123';

    const user = await prisma.profiles.findUnique({
      where: { email },
      include: {
        user_roles: true
      }
    });

    if (!user) {
      console.log('❌ Super admin user NOT found');
      console.log('Run "npm run create-admin" to create the super admin user');
      return;
    }

    console.log('\n✅ Super admin found:');
    console.log('==================================');
    console.log('  Email:', user.email);
    console.log('  User ID:', user.user_id);
    console.log('  Full Name:', user.full_name);
    console.log('  Has password hash:', !!user.password_hash);
    console.log('  Password hash length:', user.password_hash?.length || 0);
    console.log('  Is active:', user.is_active);
    console.log('  Email verified:', user.email_verified);
    console.log('  User roles:');
    user.user_roles.forEach(r => {
      console.log('    -', {
        id: r.id,
        role: r.role,
        branch_id: r.branch_id,
        gym_id: r.gym_id
      });
    });

    if (user.password_hash) {
      const isValid = verifyPassword(testPassword, user.password_hash);
      console.log('  Password verification:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('\n⚠️  WARNING: Password verification failed!');
        console.log('This means the stored password hash does not match "SuperAdmin@123"');
        console.log('You may need to recreate the super admin user.');
      }
    } else {
      console.log('  Password verification: ❌ NO PASSWORD HASH');
      console.log('\n⚠️  CRITICAL: User has no password hash!');
      console.log('Run "npm run create-admin" again to fix this.');
    }
    
    console.log('==================================\n');

  } catch (error) {
    console.error('❌ Error verifying super admin:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifySuperAdmin()
  .catch((e) => {
    console.error('❌ Failed to verify super admin:', e);
    process.exit(1);
  });
