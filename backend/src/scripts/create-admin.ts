import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

async function createAdmin() {
  try {
    const email = 'admin@fitverse.com';
    const password = 'Admin@123'; // CHANGE IN PRODUCTION!
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('🔐 Creating admin user...');

    // Create user profile
    const profile = await prisma.profiles.create({
      data: {
        email,
        full_name: 'Super Administrator',
        password_hash: passwordHash,
        email_verified: true,
        is_active: true,
      }
    });

    // Assign super_admin role
    await prisma.user_roles.create({
      data: {
        user_id: profile.user_id,
        role: 'super_admin',
      }
    });


    console.log('✅ Super Admin role assigned');
    console.log('\n📧 Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   User ID:', profile.user_id);
    console.log('\n⚠️  CHANGE PASSWORD IN PRODUCTION!\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
}

createAdmin()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error('Failed:', error);
    process.exit(1);
  });
