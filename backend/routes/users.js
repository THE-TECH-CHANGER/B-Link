const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyFirebaseToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const phoneSafe = req.user && req.user.phone_number ? req.user.phone_number.replace('+', '') : 'user';
    cb(null, phoneSafe + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// @route   GET /api/users/profile
// @desc    Get the logged-in user's profile details
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  const firebasePhone = req.user.phone_number;
  // Extract just the base number (last 10 digits) to match our DB format
  const baseNumber = firebasePhone ? firebasePhone.slice(-10) : null;
  
  try {
    let userResult;
    if (baseNumber) {
      userResult = await db.query(
        `SELECT u.id, u.name, u.mobile_number, u.profile_picture, u.role, d.blood_group, d.is_available, d.last_donation_date 
         FROM users u
         LEFT JOIN donors d ON u.id = d.user_id
         WHERE u.mobile_number = $1`,
        [baseNumber]
      );
    } else {
      return res.status(400).json({ error: 'Mobile number not found in Firebase token.' });
    }

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const userProfile = userResult.rows[0];
    
    // Fetch total donations (if donor)
    let donationsCount = 0;
    if (userProfile.role === 'donor') {
      const donationStats = await db.query(
        `SELECT COUNT(*) FROM requests WHERE status = 'fulfilled' AND fulfilled_by = $1`,
        [userProfile.id]
      );
      donationsCount = parseInt(donationStats.rows[0].count, 10);
    }

    res.json({ ...userProfile, donationsCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

// @route   GET /api/users/history
// @desc    Get user's past requests and fulfilled donations
router.get('/history', verifyFirebaseToken, async (req, res) => {
  const firebasePhone = req.user.phone_number;
  const baseNumber = firebasePhone ? firebasePhone.slice(-10) : null;

  try {
    const userResult = await db.query('SELECT id FROM users WHERE mobile_number = $1', [baseNumber]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const userId = userResult.rows[0].id;

    // Fetch requests made by user
    const requestsResult = await db.query(
      `SELECT r.*, u.name as target_hospital_name 
       FROM requests r
       LEFT JOIN users u ON r.target_hospital_id = u.id
       WHERE r.requester_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    // Fetch requests fulfilled by user (donations)
    const donationsResult = await db.query(
      `SELECT r.*, u.name as target_hospital_name
       FROM requests r
       LEFT JOIN users u ON r.target_hospital_id = u.id
       WHERE r.fulfilled_by = $1
       ORDER BY r.updated_at DESC`,
      [userId]
    );

    res.json({
      requests: requestsResult.rows,
      donations: donationsResult.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching history.' });
  }
});

// @route   POST /api/users/fcm-token
// @desc    Update FCM Push Notification token
router.post('/fcm-token', verifyFirebaseToken, async (req, res) => {
  const firebasePhone = req.user.phone_number;
  const baseNumber = firebasePhone ? firebasePhone.slice(-10) : null;
  const { fcm_token } = req.body;

  try {
    await db.query(
      'UPDATE users SET fcm_token = $1 WHERE mobile_number = $2',
      [fcm_token, baseNumber]
    );
    res.json({ message: 'FCM Token updated successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error updating FCM token.' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile and notification preferences
router.put('/profile', verifyFirebaseToken, async (req, res) => {
  const firebasePhone = req.user.phone_number;
  const baseNumber = firebasePhone ? firebasePhone.slice(-10) : null;
  const { name, blood_group, is_available } = req.body;

  try {
    const userResult = await db.query('SELECT id FROM users WHERE mobile_number = $1', [baseNumber]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const userId = userResult.rows[0].id;

    // Update name in users table
    if (name) {
      await db.query('UPDATE users SET name = $1 WHERE id = $2', [name, userId]);
    }

    // Update donors table
    if (blood_group !== undefined || is_available !== undefined) {
      // Check if donor record exists
      const donorCheck = await db.query('SELECT * FROM donors WHERE user_id = $1', [userId]);
      if (donorCheck.rows.length > 0) {
        // Build dynamic update query
        let query = 'UPDATE donors SET ';
        const values = [];
        let i = 1;
        if (blood_group) {
          query += `blood_group = $${i++} `;
          values.push(blood_group);
        }
        if (is_available !== undefined) {
          if (values.length > 0) query += ', ';
          query += `is_available = $${i++} `;
          values.push(is_available);
        }
        query += `WHERE user_id = $${i}`;
        values.push(userId);
        
        await db.query(query, values);
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// @route   POST /api/users/profile-picture
// @desc    Upload profile picture
router.post('/profile-picture', verifyFirebaseToken, upload.single('profile_picture'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const firebasePhone = req.user.phone_number;
  const baseNumber = firebasePhone ? firebasePhone.slice(-10) : null;
  const filePath = `/uploads/${req.file.filename}`;

  try {
    await db.query('UPDATE users SET profile_picture = $1 WHERE mobile_number = $2', [filePath, baseNumber]);
    res.json({ message: 'Profile picture uploaded successfully', profile_picture: filePath });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error updating profile picture.' });
  }
});

module.exports = router;
