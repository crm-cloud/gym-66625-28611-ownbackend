import { hashPassword, verifyPassword } from '../src/utils/crypto-utils.js';

// Test password hashing and verification
const testPassword = 'SuperAdmin@123';
console.log('Testing password hashing and verification...');
console.log('Password to hash:', testPassword);

// Hash the password
const hashedPassword = hashPassword(testPassword);
console.log('Hashed password:', hashedPassword);

// Verify the password
const isMatch = verifyPassword(testPassword, hashedPassword);
console.log('Password verification result:', isMatch ? '✅ Success' : '❌ Failed');

// Check against the stored hash in the database
const storedHash = 'bc6800187ac939304d29174c37dd494e:10000:64:sha512:677baf4b285bf82c5a71a79406a7e60ff290aa3983cb45fee186cfc65e616ce2d647767f332ebcdab6a3a4228d03a8c15845086701b9e063103e85e941890bde';
console.log('\nTesting against stored hash...');
console.log('Stored hash:', storedHash);

const isStoredMatch = verifyPassword(testPassword, storedHash);
console.log('Stored hash verification result:', isStoredMatch ? '✅ Success' : '❌ Failed');

if (!isStoredMatch) {
  console.log('\nDebugging stored hash verification...');
  const [salt, iterations, keylen, digest, hash] = storedHash.split(':');
  console.log('Hash components:', {
    saltLength: salt?.length,
    iterations,
    keylen,
    digest,
    hashLength: hash?.length
  });
}
