const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_gEo9fKzINB7q@ep-icy-meadow-adpn3seg.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false // Required for Neon and many hosted providers
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
