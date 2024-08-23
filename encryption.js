const crypto = require('crypto');
const { generateKeyPairSync } = require('crypto');

// Generate RSA key pair for asymmetric encryption (optional for key exchange)
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

// AES encryption parameters
const algorithm = 'aes-256-cbc';

// Function to encrypt a message
function encryptMessage(message, key) {
  const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(message);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}


// Function to decrypt a message
function decryptMessage(encrypted, key, iv) {
  const keyBuffer = Buffer.from(key, 'hex'); // Convert key from hex to Buffer
  const ivBuffer = Buffer.from(iv, 'hex');   // Convert iv from hex to Buffer

  // Validate key length
  if (![16, 24, 32].includes(keyBuffer.length)) {
    throw new RangeError('Invalid key length');
  }

  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
  let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encryptMessage, decryptMessage };


// Export functions and keys
module.exports = { publicKey, privateKey, encryptMessage, decryptMessage };
