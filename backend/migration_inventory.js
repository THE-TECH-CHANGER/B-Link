const db = require('./db');

async function migrate() {
  try {
    await db.query(`DROP TABLE IF EXISTS inventory;`);
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        hospital_id INTEGER NOT NULL REFERENCES users(id),
        blood_group VARCHAR(5) NOT NULL,
        units INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(hospital_id, blood_group)
      );
    `);
    console.log("Inventory table created successfully.");

    // Initialize with 0 units for the default hospital (id = 1)
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const bg of bloodGroups) {
      await db.query(`
        INSERT INTO inventory (hospital_id, blood_group, units)
        VALUES (1, $1, 10) -- Seed with 10 units
        ON CONFLICT (hospital_id, blood_group) DO NOTHING;
      `, [bg]);
    }
    console.log("Seeded inventory for default hospital.");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

migrate();
