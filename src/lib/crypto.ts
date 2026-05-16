import CryptoJS from 'crypto-js';

const ITERATIONS = 1000;
const KEY_SIZE = 256 / 32;

/**
 * Derives a key from a password and salt using PBKDF2
 */
function deriveKey(password: string, salt: string) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });
}

/**
 * Encrypts data using AES
 */
export function encryptData(data: any, password: string): { cipherText: string; salt: string } {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const key = deriveKey(password, salt);
  const jsonString = JSON.stringify(data);
  const cipherText = CryptoJS.AES.encrypt(jsonString, key.toString()).toString();
  return { cipherText, salt };
}

/**
 * Decrypts data using AES
 */
export function decryptData(cipherText: string, password: string, salt: string): any {
  try {
    const key = deriveKey(password, salt);
    const bytes = CryptoJS.AES.decrypt(cipherText, key.toString());
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) return null;
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Hashes a password for verification (optional, but good for quick checks)
 */
export function hashPassword(password: string, salt: string): string {
  return CryptoJS.SHA256(password + salt).toString();
}
