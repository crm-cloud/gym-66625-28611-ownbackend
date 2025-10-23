import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }
}

const prisma = new PrismaClient();

// Function to hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Create readline interface
const rl = readline.createInterface({ input, output });

// Function to ask question in terminal
const question = async (query: string): Promise<string> => {
  return await rl.question(query);
};

// Simple password input using readline
const getPassword = async (prompt: string, isConfirm: boolean = false): Promise<string> => {
  // For password input, we'll just use readline without hiding the input
  // for better compatibility
  const answer = await question(prompt);
  
  if (isConfirm) {
    console.log(''); // Add newline after confirm password
  }
  
  return answer;
};

async function createSuperAdmin() {
  console.log('🔧 Starting super admin creation...');
  
  // Get user input
  const fullName = (await question('👤 Full Name (Super Admin): ')).trim() || 'Super Admin';
  const email = (await question('📧 Email (superadmin@fitverse.com): ')).trim() || 'superadmin@fitverse.com';
  
  let password, confirmPassword;
  while (true) {
    password = (await getPassword('🔑 Password (min 8 characters, leave empty for default): ')).trim() || 'SuperAdmin@123';
    
    if (password.length < 8) {
      console.log('❌ Password must be at least 8 characters long!\n');
      continue;
    }
    
    confirmPassword = (await getPassword('🔒 Confirm Password: ')).trim();
    
    if (password === confirmPassword) {
      break;
    }
    
    console.log('❌ Passwords do not match! Please try again.\n');
  }

  // Password validation is now handled in the loop above
  
  try {
    // Check if super_admin role exists, if not create it
    let superAdminRole = await prisma.roles.findFirst({
      where: { name: 'super_admin' }
    });

    if (!superAdminRole) {
      console.log('ℹ️ Creating super_admin role...');
      superAdminRole = await prisma.roles.create({
        data: {
          name: 'super_admin',
          description: 'Super Administrator with full system access'
        }
      });
      console.log('✅ Created super_admin role');
    }

    const hashedPassword = await hashPassword(password);
    const userId = randomUUID();

    // Check if user with this email already exists
    const existingUser = await prisma.profiles.findFirst({
      where: { email },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (existingUser) {
      console.log('ℹ️ User with this email already exists, updating to admin...');
      
      // Update user to be active
      await prisma.profiles.update({
        where: { user_id: existingUser.user_id },
        data: {
          is_active: true
        }
      });

      // Remove any existing roles and add SUPER_ADMIN role
      await prisma.user_roles.deleteMany({
        where: { user_id: existingUser.user_id }
      });
      
      // Add the super_admin role
      await prisma.user_roles.create({
        data: {
          user_id: existingUser.user_id,
          role_id: superAdminRole.id
        }
      });
      
      console.log(`✅ Updated existing user ${email} to super_admin`);
      console.log('👑 Admin email:', email);
      return;
    }
    
    // If we get here, we need to create a new user
    console.log('ℹ️ Creating new super admin user...');
    
    if (!superAdminRole) {
      throw new Error('Super admin role not found');
    }

    // Create the profile first
    const newSuperAdmin = await prisma.profiles.create({
      data: {
        user_id: userId,
        email,
        full_name: fullName
      },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });
    
    // Then assign the super_admin role
    await prisma.user_roles.create({
      data: {
        user_id: userId,
        role_id: superAdminRole.id
      }
    });

    console.log('✅ SUPER_ADMIN user created successfully!');
    console.log('👑 Email:', newSuperAdmin.email);
    console.log('🔑 Password: ' + (password === 'SuperAdmin@123' ? 'SuperAdmin@123 (Please change this after first login!)' : '[hidden]'));
    console.log('🔐 Role: SUPER_ADMIN with full system access');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
    process.exit(0);
  }
}

// Execute the function
createSuperAdmin().catch((error) => {
  console.error('❌ Unhandled error in createSuperAdmin:', error);
  process.exit(1);
});
