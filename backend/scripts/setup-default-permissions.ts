import { PrismaClient, permission_category } from '@prisma/client';

const prisma = new PrismaClient();

type PermissionInput = {
  name: string;
  description: string;
  category: permission_category;
};

// Default permissions for the system
const DEFAULT_PERMISSIONS: PermissionInput[] = [
  // Member Management
  { name: 'member:create', description: 'Create new members', category: 'member_management' },
  { name: 'member:read', description: 'View member details', category: 'member_management' },
  { name: 'member:update', description: 'Update member information', category: 'member_management' },
  { name: 'member:delete', description: 'Delete members', category: 'member_management' },
  
  // Finance
  { name: 'finance:create', description: 'Create financial records', category: 'finance' },
  { name: 'finance:read', description: 'View financial information', category: 'finance' },
  { name: 'finance:update', description: 'Update financial records', category: 'finance' },
  { name: 'finance:delete', description: 'Delete financial records', category: 'finance' },
  { name: 'payment:process', description: 'Process payments', category: 'finance' },
  
  // Scheduling
  { name: 'schedule:create', description: 'Create schedules', category: 'scheduling' },
  { name: 'schedule:read', description: 'View schedules', category: 'scheduling' },
  { name: 'schedule:update', description: 'Update schedules', category: 'scheduling' },
  { name: 'schedule:delete', description: 'Delete schedules', category: 'scheduling' },
  
  // Reporting
  { name: 'report:view', description: 'View reports', category: 'reporting' },
  { name: 'report:generate', description: 'Generate reports', category: 'reporting' },
  { name: 'report:export', description: 'Export reports', category: 'reporting' },
  
  // Settings
  { name: 'settings:read', description: 'View settings', category: 'settings' },
  { name: 'settings:update', description: 'Update settings', category: 'settings' },
  
  // Staff Management
  { name: 'staff:create', description: 'Create staff members', category: 'staff' },
  { name: 'staff:read', description: 'View staff details', category: 'staff' },
  { name: 'staff:update', description: 'Update staff information', category: 'staff' },
  { name: 'staff:delete', description: 'Delete staff members', category: 'staff' },
  
  // Super Admin (special permission)
  { name: '*', description: 'All permissions (super admin)', category: 'settings' }
];

async function setupDefaultPermissions() {
  try {
    console.log('Setting up default permissions...');
    
    // Create permissions that don't exist yet
    const createdPermissions = [];
    
    for (const permission of DEFAULT_PERMISSIONS) {
      const existing = await prisma.permissions.findUnique({
        where: { name: permission.name }
      });
      
      if (!existing) {
        const newPermission = await prisma.permissions.create({
          data: permission
        });
        createdPermissions.push(newPermission);
      } else {
        // Update existing permission if needed
        const updatedPermission = await prisma.permissions.update({
          where: { id: existing.id },
          data: permission
        });
        createdPermissions.push(updatedPermission);
      }
    }
    
    console.log(`✅ Created/updated ${createdPermissions.length} permissions`);
    
    // Now ensure the super admin role has all permissions
    const superAdminRole = await prisma.roles.findUnique({
      where: { name: 'super_admin' },
      include: {
        role_permissions: true
      }
    });
    
    if (!superAdminRole) {
      console.log('Super admin role not found. Creating...');
      await prisma.roles.create({
        data: {
          name: 'super_admin',
          description: 'Super Administrator with full system access',
          scope: 'global'
        }
      });
      console.log('✅ Created super_admin role');
    } else {
      console.log('Found super_admin role, ensuring it has all permissions...');
      
      // Get all permission IDs
      const allPermissions = await prisma.permissions.findMany();
      const existingPermissionIds = superAdminRole.role_permissions.map(rp => rp.permission_id);
      
      // Find missing permissions
      const missingPermissions = allPermissions.filter(
        p => !existingPermissionIds.includes(p.id)
      );
      
      // Add missing permissions
      if (missingPermissions.length > 0) {
        console.log(`Adding ${missingPermissions.length} missing permissions to super_admin role...`);
        
        await prisma.role_permissions.createMany({
          data: missingPermissions.map(p => ({
            role_id: superAdminRole.id,
            permission_id: p.id
          })),
          skipDuplicates: true
        });
        
        console.log(`✅ Added ${missingPermissions.length} permissions to super_admin role`);
      } else {
        console.log('✅ Super admin role already has all permissions');
      }
    }
    
    console.log('\n✨ Default permissions setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up default permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
setupDefaultPermissions()
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
