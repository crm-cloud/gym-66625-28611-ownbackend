import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureSuperAdminPermissions() {
  try {
    // 1. Ensure the super_admin role exists with global scope
    const superAdminRole = await prisma.roles.upsert({
      where: { name: 'super_admin' },
      update: { 
        description: 'Super Administrator with full system access',
        scope: 'global'
      },
      create: {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        scope: 'global'
      },
    });

    console.log('✅ Super admin role ensured:', superAdminRole);

    // 2. Get all permissions from the system
    const allPermissions = await prisma.permissions.findMany();
    
    if (allPermissions.length === 0) {
      console.log('No permissions found in the system. Creating default permissions...');
      // You might want to add some default permissions here if needed
      // For now, we'll just exit
      console.log('Please ensure you have some permissions defined in the system.');
      return;
    }

    console.log(`Found ${allPermissions.length} permissions in the system`);

    // 3. Assign all permissions to super_admin role
    const permissionAssignments = await Promise.all(
      allPermissions.map(permission => 
        prisma.role_permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: superAdminRole.id,
              permission_id: permission.id
            }
          },
          update: {},
          create: {
            role_id: superAdminRole.id,
            permission_id: permission.id
          }
        })
      )
    );

    console.log(`✅ Assigned ${permissionAssignments.length} permissions to super_admin role`);

    // 4. Find the super admin user (assuming it was created by create-super-admin.ts)
    const superAdminUser = await prisma.profiles.findFirst({
      where: {
        user_roles: {
          some: {
            role: 'super_admin'
          }
        }
      },
      include: {
        user_roles: true
      }
    });

    if (!superAdminUser) {
      console.log('⚠️ No super admin user found. Please run create-super-admin.ts first.');
      return;
    }

    console.log('Super admin user:', {
      email: superAdminUser.email,
      userId: superAdminUser.user_id,
      roles: superAdminUser.user_roles.map(r => r.role)
    });

    // 5. Ensure the user has the super_admin role assigned
    const userRole = superAdminUser.user_roles.find(r => r.role === 'super_admin');
    
    if (!userRole) {
      console.log('Assigning super_admin role to user...');
      await prisma.user_roles.create({
        data: {
          user_id: superAdminUser.user_id,
          role: 'super_admin',
          role_id: superAdminRole.id
        }
      });
      console.log('✅ Assigned super_admin role to user');
    } else {
      console.log('✅ User already has super_admin role');
    }

    console.log('\n✨ Super admin setup complete!');
    console.log(`Email: ${superAdminUser.email}`);
    console.log('This user now has full access to all system features.');

  } catch (error) {
    console.error('❌ Error ensuring super admin permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensureSuperAdminPermissions()
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
