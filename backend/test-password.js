import { pbkdf2Sync } from 'crypto';

function verifyPassword(password, storedHash) {
  try {
    const [salt, iterations, keylen, digest, hash] = storedHash.split(':');
    const hashVerify = pbkdf2Sync(
      password,
      salt,
      parseInt(iterations, 10),
      parseInt(keylen, 10),
      digest
    ).toString('hex');
    return hash === hashVerify;
  } catch (e) {
    console.error('Error:', e.message);
    return false;
  }
}

const storedHash = '327e886789eab100b44ff46a96c7805e:10000:64:sha512:7ad9b7cc122c86f96832c02f49ab1721b25d4f9cc20f88fd0f9309f63c9ace48b74ff75541f1644dc58cfad068489dc8251f509895d2b998f3be4378a7c53bb8';

const passwords = [
  'admin123',
  'Admin@123',
  'SuperAdmin@123',
  'password',
  'Password123!',
  'superadmin'
];

console.log('Testing password verification...');
passwords.forEach(pass => {
  const isValid = verifyPassword(pass, storedHash);
  console.log(`Password: "${pass}" ${isValid ? '✅' : '❌'}`);
});
