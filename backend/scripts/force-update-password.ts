// scripts/force-update-password.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function forceUpdatePassword() {
  try {
    const email = 'superadmin@example.com';
    const newPassword = 'SuperAdmin@123';
    const saltRounds = 10;
    
    console.log('🔐 Hashing new password with bcrypt...');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Find the existing admin
    const existingAdmin = await prisma.profiles.findUnique({
      where: { email },
    });

    if (!existingAdmin) {
      console.error('❌ Super admin user not found.');
      return;
    }

    console.log('🔄 Force updating super admin password...');
    
    // Force update the password hash
    await prisma.profiles.update({
      where: { user_id: existingAdmin.user_id },
      data: { 
        password_hash: passwordHash,
        is_active: true,
        email_verified: true
      }
    });
    
    console.log('✅ Password hash updated successfully');
    console.log('🎉 Super admin password has been reset to: SuperAdmin@123');
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
forceUpdatePassword()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
