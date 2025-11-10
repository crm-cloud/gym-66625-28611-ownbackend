// scripts/create-super-admin.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin@123';
    const userId = uuidv4();
    
    // Hash the password using bcrypt
    console.log('🔐 Hashing password with bcrypt...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully with bcrypt');

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
            is_active: true,
            email_verified: true
          }
        });
        console.log('✅ Password hash and settings updated');
      }
      
      return;
    }

    // Get the super admin role ID
    const superAdminRole = await prisma.roles.findUnique({
      where: { name: 'super_admin' }
    });

    if (!superAdminRole) {
      throw new Error('Super admin role not found in the database');
    }

    // Create the super admin user
    await prisma.$transaction(async (tx) => {
      // First create the profile
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
          created_at: new Date(),
          updated_at: new Date(),
          // Create the user_roles relationship in the same operation
          user_roles: {
            create: {
              id: uuidv4(),
              role: 'super_admin',
              role_id: superAdminRole.id,
              created_at: new Date()
            }
          }
        },
        include: {
          user_roles: true
        }
      });

      console.log('✅ Profile and role created:', profile.user_id);
    });

    console.log('\n✅ Super admin created successfully!');
    console.log('==================================');
    console.log('Email: superadmin@example.com');
    console.log('Password: SuperAdmin@123');
    console.log('==================================');
    console.log('\n⚠️  IMPORTANT: Change password after first login!');
    console.log('📧 Email verified: true');
    console.log('✅ Account active: true');
    console.log('🔐 Role: super_admin (stored in user_roles table)');
    console.log('🌍 Scope: Global (no gym or branch assignment)');

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