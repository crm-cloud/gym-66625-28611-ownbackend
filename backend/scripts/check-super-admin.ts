import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    // First find the super_admin role
    const superAdminRole = await prisma.roles.findFirst({
      where: {
        name: 'super_admin'
      }
    });

    if (!superAdminRole) {
      console.log('❌ Super admin role not found');
      return;
    }

    // Find super admin user
    const superAdmin = await prisma.profiles.findFirst({
      where: {
        user_roles: {
          some: {
            role_id: superAdminRole.id
          }
        }
      },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!superAdmin) {
      console.log('❌ No super admin user found');
      return;
    }

    console.log('Super Admin User:', {
      id: superAdmin.user_id,
      email: superAdmin.email,
      // @ts-ignore - is_active exists in the database but not in the generated types
      is_active: superAdmin.is_active,
      // @ts-ignore - email_verified exists in the database but not in the generated types
      email_verified: superAdmin.email_verified,
      roles: superAdmin.user_roles.map(r => ({
        role: r.roles.name,
        branch_id: r.branch_id
      }))
    });

    // Check if the user has a password hash
    // @ts-ignore - password_hash exists in the database but not in the generated types
    if (!superAdmin.password_hash) {
      console.log('❌ No password hash found for super admin');
    } else {
      console.log('✅ Password hash exists');
    }

  } catch (error) {
    console.error('Error checking super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkSuperAdmin()
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
