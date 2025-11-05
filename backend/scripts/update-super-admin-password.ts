// scripts/update-super-admin-password.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Directly include the hashing function to avoid module resolution issues
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 10000;
  const keylen = 64;
  const digest = 'sha512';
  
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return `${salt}:${iterations}:${keylen}:${digest}:${hash}`;
}

const prisma = new PrismaClient();

async function updateSuperAdminPassword() {
  try {
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin@123';
    
    // Hash the password
    console.log('🔐 Hashing new password...');
    const passwordHash = hashPassword(password);
    
    // Find the existing admin
    const existingAdmin = await prisma.profiles.findUnique({
      where: { email },
      include: { user_roles: true }
    });

    if (!existingAdmin) {
      console.error('❌ Super admin user not found. Please run create-super-admin-fixed.ts first.');
      return;
    }

    console.log('🔄 Updating super admin password and settings...');
    
    // Always update the password hash
    await prisma.profiles.update({
      where: { user_id: existingAdmin.user_id },
      data: { 
        password_hash: passwordHash,
        is_active: true,
        email_verified: true
      }
    });
    console.log('✅ Password hash and settings updated');
    
    // Check if user already has the super_admin role
    const hasSuperAdminRole = existingAdmin.user_roles.some(r => r.role === 'super_admin');
    
    if (!hasSuperAdminRole) {
      console.log('🔑 Assigning super admin role...');
      // Find or create the super_admin role
      const role = await prisma.roles.upsert({
        where: { name: 'super_admin' },
        update: {},
        create: {
          name: 'super_admin',
          description: 'Super Administrator with full access',
          scope: 'global'
        }
      });
      
      // Assign the role
      await prisma.user_roles.create({
        data: {
          user_id: existingAdmin.user_id,
          role: 'super_admin',
          role_id: role.id,
          created_at: new Date()
        }
      });
      console.log('✅ Super admin role assigned');
    } else {
      console.log('✅ User already has super admin role');
    }
    
    console.log('🎉 Super admin password update complete!');
    console.log({
      email: existingAdmin.email,
      userId: existingAdmin.user_id,
      password: password // Only shown for debugging - remove in production!
    });
    
  } catch (error) {
    console.error('❌ Error updating super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateSuperAdminPassword()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
