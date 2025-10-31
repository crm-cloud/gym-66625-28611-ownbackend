// scripts/create-super-admin-fixed.ts
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

async function createSuperAdmin() {
  try {
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin@123';
    const userId = uuidv4();
    
    // Hash the password
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
            is_active: true,
            email_verified: true
          }
        });
        console.log('✅ Password hash and settings updated');
      }
      
      // Check if user already has the super_admin role
      const hasSuperAdminRole = existingAdmin.user_roles.some(r => r.role === 'super_admin');
      
      if (!hasSuperAdminRole) {
        console.log('🔑 Assigning super admin role...');
        // First, find or create the super_admin role
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
      
      console.log('🎉 Super admin setup complete!');
      console.log({
        email: existingAdmin.email,
        userId: existingAdmin.user_id,
        password: password // Only shown for initial setup - remove in production!
      });
      
      return;
    }

    // Create the super admin user with role in a transaction
    console.log('👤 Creating super admin user with role...');
    const [user, role] = await prisma.$transaction([
      prisma.profiles.create({
        data: {
          user_id: userId,
          email,
          password_hash: passwordHash,
          full_name: 'Super Admin',
          is_active: true,
          email_verified: true,
          created_at: new Date(),
          updated_at: new Date(),
        }
      }),
      // First, find or create the super_admin role
      prisma.roles.upsert({
        where: { name: 'super_admin' },
        update: {},
        create: {
          name: 'super_admin',
          description: 'Super Administrator with full access',
          scope: 'global'
        }
      })
    ]);

    // Assign the role to the user
    console.log('🔑 Assigning super admin role...');
    await prisma.user_roles.create({
      data: {
        user_id: user.user_id,
        role: 'super_admin', // This is the role name as per the enum
        role_id: role.id,    // This is the foreign key to the roles table
        created_at: new Date()
      }
    });

    console.log('🎉 Super admin created successfully!');
    console.log({
      email: user.email,
      userId: user.user_id,
      password: password // Only shown for initial setup - remove in production!
    });

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
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
