import { verifyPassword } from '../src/utils/crypto-utils';

// The stored hash from the database
const storedHash = 'bc6800187ac939304d29174c37dd494e:10000:64:sha512:677baf4b285bf82c5a71a79406a7e60ff290aa3983cb45fee186cfc65e616ce2d647767f332ebcdab6a3a4228d03a8c15845086701b9e063103e85e941890bde';
const password = 'SuperAdmin@123';

// Verify the password
const isValid = verifyPassword(password, storedHash);

console.log('Password verification result:', isValid ? '✅ Valid' : '❌ Invalid');

// If invalid, try to understand why
if (!isValid) {
  console.log('\nDebugging info:');
  const [salt, iterations, keylen, digest, hash] = storedHash.split(':');
  console.log('Hash parts:', { 
    saltLength: salt?.length,
    iterations,
    keylen,
    digest,
    hashLength: hash?.length
  });
}
