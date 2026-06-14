const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://bloodlink_db_bvhb_user:cg42tFuIMslSlWTRAreq3HfaOQtouYbk@dpg-d8n5v63bc2fs73eksn2g-a.oregon-postgres.render.com/bloodlink_db_bvhb',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
  return client.query(
    `INSERT INTO users (name, mobile_number, role, latitude, longitude, location) 
     VALUES ($1, $2, $3, $4::numeric, $5::numeric, ST_SetSRID(ST_MakePoint($5::float8, $4::float8), 4326)) 
     RETURNING id, name, role`,
    ['Test Name 3', '8075678332', 'donor', 12.34, 56.78]
  );
}).then(res => {
  console.log('INSERT USER SUCCEEDED:', res.rows);
  return client.query(
    `INSERT INTO donors (user_id, blood_group) VALUES ($1, $2)`,
    [res.rows[0].id, 'A+']
  );
}).then(res => {
  console.log('INSERT DONOR SUCCEEDED');
  client.end();
}).catch(e => {
  console.error('ERROR OCCURRED:', e.message);
  client.end();
});
