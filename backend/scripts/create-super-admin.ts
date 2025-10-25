// scripts/create-super-admin.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../src/utils/crypto-utils';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin@123';
    const userId = uuidv4();
    
    // Hash the password using the same method as registration
    console.log('🔐 Hashing password...');
    const passwordHash = hashPassword(password);
    console.log('✅ Password hashed successfully');

    // Check if super admin already exists
    const existingAdmin = await prisma.profiles.findUnique({
      where: { email },
      include: { user_roles: true }
    });

    if (existingAdmin) {
      console.log('⚠️  Super admin already exists:', {
        email: existingAdmin.email,
        userId: existingAdmin.user_id,
        hasPassword: !!existingAdmin.password_hash,
        roles: existingAdmin.user_roles.map(r => r.role)
      });
      
      // Update password if missing
      if (!existingAdmin.password_hash) {
        console.log('🔧 Updating missing password hash...');
        await prisma.profiles.update({
          where: { user_id: existingAdmin.user_id },
          data: { 
            password_hash: passwordHash,
            role: 'super_admin',
            is_active: true,
            email_verified: true
          }
        });
        console.log('✅ Password hash and settings updated');
      }
      
      return;
    }

    // Create the super admin user
    await prisma.$transaction(async (tx) => {
      // Create the profile with password hash
      const profile = await tx.profiles.create({
        data: {
          user_id: userId,
          email: email,
          full_name: 'Super Admin',
          phone: '+1234567890',
          password_hash: passwordHash,
          avatar_url: 'https://ui-avatars.com/api/?name=Super+Admin&background=random',
          is_active: true,
          email_verified: true,
          role: 'super_admin',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // Create user_roles entry with role
      await tx.user_roles.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          role: 'super_admin',
          created_at: new Date(),
        }
      });

      console.log('✅ Profile created:', profile.user_id);
    });

    console.log('\n✅ Super admin created successfully!');
    console.log('==================================');
    console.log('Email: superadmin@example.com');
    console.log('Password: SuperAdmin@123');
    console.log('==================================');
    console.log('\n⚠️  IMPORTANT: Change password after first login!');
    console.log('📧 Email verified: true');
    console.log('✅ Account active: true');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSuperAdmin()
  .catch((e) => {
    console.error('❌ Failed to create super admin:', e);
    process.exit(1);
  });