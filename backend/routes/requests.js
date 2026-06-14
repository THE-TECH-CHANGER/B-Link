const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   POST /api/requests
// @desc    Create a new emergency blood request & trigger matching
router.post('/', async (req, res) => {
  const { requester_id, blood_group, units_required, urgency_level, target_hospital_id } = req.body;

  try {
    // 1. Create the Request
    const requestResult = await db.query(
      `INSERT INTO requests (requester_id, blood_group, units_required, urgency_level, target_hospital_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [requester_id, blood_group, units_required, urgency_level, target_hospital_id]
    );
    const newRequest = requestResult.rows[0];

    // 2. Fetch the target hospital's location
    const hospitalResult = await db.query('SELECT location, latitude, longitude FROM users WHERE id = $1', [target_hospital_id]);
    if (hospitalResult.rows.length === 0) {
       return res.status(400).json({ error: 'Target hospital not found.' });
    }
    const hospital = hospitalResult.rows[0];

    // 3. The Smart Matching Engine (Geofencing using PostGIS ST_Distance)
    // Find active donors with matching blood group within 10km (10000 meters) of the hospital
    const matchedDonors = await db.query(
      `SELECT u.id, u.name, u.mobile_number, u.fcm_token,
              ST_Distance(u.location, $1) as distance_meters
       FROM users u
       JOIN donors d ON u.id = d.user_id
       WHERE u.role = 'donor' 
       AND d.blood_group = $2 
       AND d.is_available = TRUE
       AND ST_DWithin(u.location, $1, 10000)
       ORDER BY distance_meters ASC
       LIMIT 50`,
       [hospital.location, blood_group] // $1 is hospital location (GEOMETRY), $2 is blood group
    );

    // 4. Trigger Firebase Cloud Messaging (FCM) Push Notifications for matched donors
    const fcmTokens = matchedDonors.rows
        .map(donor => donor.fcm_token)
        .filter(token => token !== null && token !== undefined);

    if (fcmTokens.length > 0) {
      console.log(`Sending Emergency Push Notifications to ${fcmTokens.length} devices.`);
      const { getMessaging } = require('firebase-admin/messaging');
      await getMessaging().sendEachForMulticast({ 
        tokens: fcmTokens, 
        notification: { 
          title: 'Emergency Blood Request', 
          body: `${units_required} units of ${blood_group} needed at ${hospital.name}.` 
        } 
      });
    }

    res.status(201).json({ 
      message: 'Emergency request broadcasted successfully.', 
      request: newRequest,
      matched_donors_count: matchedDonors.rows.length,
      matched_donors: matchedDonors.rows 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error processing request.' });
  }
});

// @route   GET /api/requests/active
// @desc    Get all active emergency requests
router.get('/active', async (req, res) => {
  try {
    const activeRequests = await db.query(
      `SELECT r.*, u.name as requester_name 
       FROM requests r 
       JOIN users u ON r.requester_id = u.id 
       WHERE r.status = 'pending' 
       ORDER BY r.created_at DESC`
    );
    res.json(activeRequests.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching active requests.' });
  }
});

// @route   GET /api/requests
// @desc    Get all emergency requests (active and fulfilled)
router.get('/', async (req, res) => {
  try {
    const allRequests = await db.query(
      `SELECT r.*, u.name as requester_name 
       FROM requests r 
       JOIN users u ON r.requester_id = u.id 
       ORDER BY r.created_at DESC`
    );
    res.json(allRequests.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching all requests.' });
  }
});
// @route   PUT /api/requests/:id/fulfill
// @desc    Mark an emergency request as fulfilled
router.put('/:id/fulfill', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch request details first
    const requestRes = await db.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (requestRes.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    const reqData = requestRes.rows[0];

    // Mark as fulfilled
    const result = await db.query(
      `UPDATE requests 
       SET status = 'fulfilled' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    // Deduct units from inventory (hospital_id is hardcoded to 1 for MVP)
    await db.query(
      `UPDATE inventory 
       SET units = GREATEST(0, units - $1), last_updated = CURRENT_TIMESTAMP
       WHERE hospital_id = 1 AND blood_group = $2`,
      [reqData.units_required, reqData.blood_group]
    );

    res.json({ message: 'Request marked as fulfilled and inventory updated', request: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fulfilling request.' });
  }
});

module.exports = router;
