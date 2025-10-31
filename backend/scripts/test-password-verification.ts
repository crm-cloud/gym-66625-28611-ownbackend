import { hashPassword, verifyPassword } from '../src/utils/crypto-utils.js';

// Test password and hash
const testPassword = 'SuperAdmin@123';
const storedHash = 'bc6800187ac939304d29174c37dd494e:10000:64:sha512:677baf4b285bf82c5a71a79406a7e60ff290aa3983cb45fee186cfc65e616ce2d647767f332ebcdab6a3a4228d03a8c15845086701b9e063103e85e941890bde';

console.log('🔑 Testing password verification...');
console.log('🔑 Input password:', testPassword);
console.log('🔑 Stored hash:', storedHash);

// Test 1: Verify the stored hash with the test password
console.log('\n🔍 Test 1: Verifying stored hash with test password');
const isVerified = verifyPassword(testPassword, storedHash);
console.log('✅ Verification result:', isVerified ? 'PASSED' : 'FAILED');

// Test 2: Generate a new hash and verify it
console.log('\n🔍 Test 2: Generating new hash and verifying');
const newHash = hashPassword(testPassword);
console.log('🔑 New hash:', newHash);
const isNewHashVerified = verifyPassword(testPassword, newHash);
console.log('✅ New hash verification:', isNewHashVerified ? 'PASSED' : 'FAILED');

// Test 3: Test with wrong password
console.log('\n🔍 Test 3: Testing with wrong password');
const wrongPassword = 'WrongPassword123';
const isWrongPassword = verifyPassword(wrongPassword, storedHash);
console.log('✅ Wrong password test:', !isWrongPassword ? 'PASSED' : 'FAILED');

// Test 4: Test hash format validation
console.log('\n🔍 Test 4: Testing invalid hash format');
const invalidHash = 'invalid:hash:format';
try {
  const isInvalidHash = verifyPassword(testPassword, invalidHash);
  console.log('✅ Invalid hash test:', !isInvalidHash ? 'PASSED' : 'FAILED');
} catch (error) {
  console.error('❌ Invalid hash test failed with error:', error);
}

console.log('\n🔍 Test 5: Verifying hash components');
const [salt, iterations, keylen, digest, hash] = storedHash.split(':');
console.log('🔑 Hash components:');
console.log('- Salt:', salt);
console.log('- Iterations:', iterations);
console.log('- Key length:', keylen);
console.log('- Digest:', digest);
console.log('- Hash:', hash?.substring(0, 10) + '...');

console.log('\n✅ All tests completed');
