import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/crypto-utils.js';

const prisma = new PrismaClient();

async function updateSuperadminPassword() {
  try {
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin@123';
    
    // Hash the new password
    const passwordHash = hashPassword(password);
    
    // Update the password in the database
    const updatedUser = await prisma.profiles.update({
      where: { email },
      data: { 
        password_hash: passwordHash,
        is_active: true,
        email_verified: true
      }
    });
    
    console.log('✅ Password updated successfully');
    console.log('Email:', updatedUser.email);
    console.log('User ID:', updatedUser.user_id);
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperadminPassword();
