/**
 * Script to hash passwords for seed users
 * Run this after first deployment to update password hashes
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const DEFAULT_PASSWORD = 'Password@1';
const SALT_ROUNDS = 10;

async function hashPasswords() {
  try {
    console.log('Hashing passwords for all users...');
    
    // Generate hash
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log('Generated hash for Password@1');
    
    // Update all users with the proper hash
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE password_hash LIKE $2',
      [hash, '$2b$10$rOz%'] // Only update placeholder hashes
    );
    
    console.log(`Updated ${result.rowCount} users with proper password hashes`);
    
    // Verify login works
    const testUser = await pool.query('SELECT password_hash FROM users WHERE email = $1', ['admin@vyuhaa.com']);
    if (testUser.rows.length > 0) {
      const valid = await bcrypt.compare(DEFAULT_PASSWORD, testUser.rows[0].password_hash);
      console.log(`Password verification test: ${valid ? 'PASSED' : 'FAILED'}`);
    }
    
    console.log('Password hashing complete!');
  } catch (error) {
    console.error('Error hashing passwords:', error);
  } finally {
    await pool.end();
  }
}

hashPasswords();
