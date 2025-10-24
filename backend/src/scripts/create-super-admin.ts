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
    const hashedPassword = await hashPassword(password);
    const userId = randomUUID();

    // Check if user with this email already exists
    const existingUser = await prisma.profiles.findFirst({
      where: { email },
      include: {
        user_roles: true
      }
    });

    if (existingUser) {
      console.log('ℹ️ User with this email already exists, updating to super_admin...');
      
      // Update user profile
      await prisma.profiles.update({
        where: { user_id: existingUser.user_id },
        data: {
          full_name: fullName,
          password_hash: hashedPassword,
          is_active: true,
          email_verified: true,
        }
      });

      // Remove any existing roles
      await prisma.user_roles.deleteMany({
        where: { user_id: existingUser.user_id }
      });
      
      // Add the super_admin role (now using enum directly)
      await prisma.user_roles.create({
        data: {
          id: randomUUID(),
          user_id: existingUser.user_id,
          role: 'super_admin',  // Direct enum, not role_id
          created_at: new Date(),
        }
      });
      
      console.log(`✅ Updated existing user ${email} to super_admin`);
      console.log('👑 Admin email:', email);
      console.log('🔑 Password updated');
      return;
    }
    
    // Create new super admin user
    console.log('ℹ️ Creating new super admin user...');

    // Create the profile
    const newSuperAdmin = await prisma.profiles.create({
      data: {
        user_id: userId,
        email,
        full_name: fullName,
        password_hash: hashedPassword,
        is_active: true,
        email_verified: true,
      }
    });
    
    // Assign the super_admin role (using enum directly)
    await prisma.user_roles.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        role: 'super_admin',  // Direct enum, not role_id
        created_at: new Date(),
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
