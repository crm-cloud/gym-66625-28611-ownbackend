import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin@123';
    
    // Check if super admin already exists
    const existingAdmin = await prisma.profiles.findUnique({
      where: { email },
      include: { user_roles: true }
    });

    if (existingAdmin) {
      console.log('User already exists. Updating to super admin role...');
      
      // Check if user already has super_admin role
      const hasSuperAdminRole = existingAdmin.user_roles.some(r => r.role === 'super_admin');
      
      if (hasSuperAdminRole) {
        console.log('User already has super_admin role:', {
          email: existingAdmin.email,
          userId: existingAdmin.user_id,
          roles: existingAdmin.user_roles.map(r => r.role)
        });
        return;
      }
      
      // Add super_admin role to existing user
      await prisma.user_roles.create({
        data: {
          id: uuidv4(),
          user_id: existingAdmin.user_id,
          role: 'super_admin',
          created_at: new Date()
        }
      });
      
      console.log('Added super_admin role to existing user:', {
        email: existingAdmin.email,
        userId: existingAdmin.user_id
      });
      
      console.log('\nLogin with:');
      console.log(`Email: ${email}`);
      console.log('Password: [Your existing password]\n');
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create the super admin user
    await prisma.$transaction(async (tx) => {
      // Create the user profile with required fields
      const superAdmin = await tx.profiles.create({
        data: {
          user_id: userId,
          email,
          full_name: 'Super Admin',
          // @ts-ignore - password_hash is not in the type but exists in the database
          password_hash: passwordHash,
          email_verified: true,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          phone: '+1234567890',
          avatar_url: 'https://ui-avatars.com/api/?name=Super+Admin&background=random',
        },
      });

      // Create the user_roles entry with the correct field names
      await tx.user_roles.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          role: 'super_admin',
          created_at: new Date(),
        },
      });

      console.log('Super admin created successfully:', {
        email: superAdmin.email,
        userId: superAdmin.user_id,
        role: 'super_admin'
      });
    });

    console.log('\nLogin with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);
    console.log('IMPORTANT: Change this password after first login!');
  } catch (error) {
    console.error('Error creating super admin:', error);
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
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
