import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetSuperadminPassword() {
  try {
    const email = 'superadmin@example.com';
    const newPassword = 'SuperAdmin@123';

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    const updatedUser = await prisma.profiles.update({
      where: { email },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date()
      }
    });

    console.log('✅ Password updated successfully for user:', updatedUser.email);
    console.log('New password:', newPassword);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
resetSuperadminPassword();
