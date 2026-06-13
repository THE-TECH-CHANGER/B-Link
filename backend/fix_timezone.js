require('dotenv').config();
const db = require('./db');

async function fixTimezone() {
  try {
    console.log('Fixing timezone in database...');
    // Alter all TIMESTAMP columns to TIMESTAMPTZ (TIMESTAMP WITH TIME ZONE)
    await db.query(`ALTER TABLE requests ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'`);
    await db.query(`ALTER TABLE requests ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'`);
    await db.query(`ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'`);
    console.log('Successfully updated database schema to use proper timezones!');
  } catch (error) {
    console.error('Error fixing timezones:', error);
  } finally {
    process.exit();
  }
}

fixTimezone();
