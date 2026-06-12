require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
// (Ensure you have a .env file with DATABASE_URL or set it in your environment)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Basic route to check if server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BloodLink Backend is running' });
});

// Placeholder for Request creation route
app.post('/api/requests', async (req, res) => {
  try {
    const { bloodGroup, units, location, urgency } = req.body;
    // In a real scenario, we'd insert into the database and trigger the matching engine
    // const newRequest = await pool.query('INSERT INTO requests ... RETURNING *');
    
    res.status(201).json({
      message: 'Emergency request received',
      data: { bloodGroup, units, urgency }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`BloodLink Server running on port ${port}`);
});
