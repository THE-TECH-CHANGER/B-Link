const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   POST /api/auth/register
// @desc    Register a new user (Donor, Hospital, Patient, Blood Bank)
router.post('/register', async (req, res) => {
  const { name, mobile_number, role, latitude, longitude, blood_group } = req.body;

  try {
    // 1. Insert into base users table
    const userResult = await db.query(
      `INSERT INTO users (name, mobile_number, role, latitude, longitude, location) 
       VALUES ($1, $2, $3, $4::numeric, $5::numeric, ST_SetSRID(ST_MakePoint($5::float8, $4::float8), 4326)) 
       RETURNING id, name, role`,
      [name, mobile_number, role, latitude, longitude]
    );

    const user = userResult.rows[0];

    // 2. Insert into specific role table
    if (role === 'donor') {
      if (!blood_group) return res.status(400).json({ error: 'Blood group required for donors.' });
      await db.query(
        `INSERT INTO donors (user_id, blood_group) VALUES ($1, $2)`,
        [user.id, blood_group]
      );
    }
    // Add logic for 'hospital', 'blood_bank' later if needed

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Mobile number already registered.' });
    }
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

const verifyFirebaseToken = require('../middleware/authMiddleware');

// @route   POST /api/auth/login
// @desc    Secure Firebase OTP Login
router.post('/login', verifyFirebaseToken, async (req, res) => {
  // req.user is populated by our middleware from the verified Firebase ID Token
  // Firebase phone numbers are formatted like "+918075678332"
  const firebasePhone = req.user.phone_number; 
  
  // Extract just the base number (last 10 digits) to match our DB format
  const baseNumber = firebasePhone ? firebasePhone.slice(-10) : req.body.mobile_number;
  
  try {
    const userResult = await db.query('SELECT * FROM users WHERE mobile_number = $1', [baseNumber]);
    if (userResult.rows.length === 0) {
      // User is authenticated via Firebase, but not registered in our PostgreSQL DB yet
      return res.status(404).json({ error: 'User not found. Please register first.', requires_registration: true, mobile_number: baseNumber });
    }
    
    // Successfully matched the secure Firebase Token to our PostgreSQL User!
    res.json({ message: 'Login successful', user: userResult.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during secure login.' });
  }
});

module.exports = router;
