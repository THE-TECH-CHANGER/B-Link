const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initRemoteDB() {
  const connectionString = "postgresql://bloodlink_db_bvhb_user:cg42tFuIMslSlWTRAreq3HfaOQtouYbk@dpg-d8n5v63bc2fs73eksn2g-a.oregon-postgres.render.com/bloodlink_db_bvhb";

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Render Postgres
  });

  try {
    console.log("Connecting to Render Database...");
    await client.connect();
    
    console.log("Executing schema...");
    const schemaSql = `
      CREATE EXTENSION IF NOT EXISTS postgis;

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'donor',
        mobile_number VARCHAR(20),
        fcm_token VARCHAR(255),
        location GEOMETRY(Point, 4326),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS donors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        blood_group VARCHAR(10),
        is_available BOOLEAN DEFAULT true,
        last_donation_date DATE
      );

      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER REFERENCES users(id),
        target_hospital_id INTEGER REFERENCES users(id),
        blood_group VARCHAR(10),
        units_required INTEGER,
        urgency_level VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        fulfilled_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        hospital_id INTEGER REFERENCES users(id),
        blood_group VARCHAR(10),
        units INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(schemaSql);
    console.log("✅ Success! Your Render database is now fully initialized with all tables.");

  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    await client.end();
  }
}

initRemoteDB();
