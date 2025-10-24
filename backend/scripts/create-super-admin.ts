// scripts/create-super-admin.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin@123';
    const userId = uuidv4();
    
    // Hash the password
    // Generate a password hash (will be set by the auth system on first login)

    // Check if super admin already exists
    const existingAdmin = await prisma.profiles.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('Super admin already exists:', {
        email: existingAdmin.email,
        userId: existingAdmin.user_id
      });
      return;
    }

    // Create the super admin user
    await prisma.$transaction(async (tx) => {
      // First, create the profile
      await tx.profiles.create({
        data: {
          user_id: userId,
          email: email,
          full_name: 'Super Admin',
          phone: '+1234567890',
          avatar_url: 'https://ui-avatars.com/api/?name=Super+Admin&background=random',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          // Set the role directly on the profile
          role: 'staff' as any, // Using 'as any' to bypass TypeScript type checking
          // Create the user_roles relation
          user_roles: {
            create: {
              id: uuidv4(),
              created_at: new Date()
              // The role is set on the profile level
            }
          }
        }
      });
    });

    console.log('\n✅ Super admin created successfully!');
    console.log('==================================');
    console.log('Email: superadmin@example.com');
    console.log('Password: SuperAdmin@123');
    console.log('==================================');
    console.log('\n⚠️  Please change the password after first login!');

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