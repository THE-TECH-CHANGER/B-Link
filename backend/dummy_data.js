const db = require('./db');

async function generateDummyData() {
  try {
    console.log('Generating dummy data...');

    // 1. Create a Hospital (Requester)
    // Coords for a central location (e.g., somewhere in Delhi)
    const hospitalLat = 28.6139;
    const hospitalLng = 77.2090;
    
    const hospitalRes = await db.query(
      `INSERT INTO users (name, mobile_number, role, latitude, longitude, location) 
       VALUES ('Apollo Hospital', '9999999999', 'hospital', $1::numeric, $2::numeric, ST_SetSRID(ST_MakePoint($2::float8, $1::float8), 4326)) 
       RETURNING id`,
      [hospitalLat, hospitalLng]
    );
    const hospitalId = hospitalRes.rows[0].id;
    
    await db.query(
      `INSERT INTO hospitals (user_id, registration_number, address) VALUES ($1, 'HOSP123', 'Central Delhi')`,
      [hospitalId]
    );

    // 2. Create Donors around the hospital
    const bloodGroups = ['O-', 'A+', 'B+', 'AB-'];
    for (let i = 0; i < 10; i++) {
      // Randomize coordinates within ~5-15km
      const offsetLat = (Math.random() - 0.5) * 0.1;
      const offsetLng = (Math.random() - 0.5) * 0.1;
      const donorLat = hospitalLat + offsetLat;
      const donorLng = hospitalLng + offsetLng;
      const bg = bloodGroups[i % bloodGroups.length];

      const donorRes = await db.query(
        `INSERT INTO users (name, mobile_number, role, latitude, longitude, location) 
         VALUES ($1, $2, 'donor', $3::numeric, $4::numeric, ST_SetSRID(ST_MakePoint($4::float8, $3::float8), 4326)) 
         RETURNING id`,
        [`Donor ${i+1}`, `888888888${i}`, donorLat, donorLng]
      );
      
      await db.query(
        `INSERT INTO donors (user_id, blood_group, is_available) VALUES ($1, $2, true)`,
        [donorRes.rows[0].id, bg]
      );
    }

    console.log('Dummy data generated successfully.');
    console.log('Hospital ID:', hospitalId);
    console.log('You can now test the matching engine using this Hospital ID.');
    process.exit(0);

  } catch (err) {
    console.error('Error generating dummy data:', err);
    process.exit(1);
  }
}

generateDummyData();
