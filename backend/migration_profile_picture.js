require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;');
    console.log('Migration successful: Added profile_picture column to users.');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await pool.end();
  }
}

runMigration();
