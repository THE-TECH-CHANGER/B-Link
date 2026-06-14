const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/inventory
// @desc    Get hospital blood bank inventory
router.get('/', async (req, res) => {
  try {
    // Hardcoded hospital_id 1 for MVP
    const hospital_id = 1;
    const inventory = await db.query(
      `SELECT blood_group, units, last_updated 
       FROM inventory 
       WHERE hospital_id = $1
       ORDER BY blood_group ASC`,
      [hospital_id]
    );
    res.json(inventory.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching inventory.' });
  }
});

// @route   PUT /api/inventory
// @desc    Update units for a specific blood group
router.put('/', async (req, res) => {
  try {
    const { blood_group, units } = req.body;
    // Hardcoded hospital_id 1 for MVP
    const hospital_id = 1;

    const result = await db.query(
      `UPDATE inventory 
       SET units = $1, last_updated = CURRENT_TIMESTAMP
       WHERE hospital_id = $2 AND blood_group = $3
       RETURNING *`,
      [units, hospital_id, blood_group]
    );

    if (result.rows.length === 0) {
      // If it doesn't exist, insert it
      const insertRes = await db.query(
        `INSERT INTO inventory (hospital_id, blood_group, units)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [hospital_id, blood_group, units]
      );
      return res.json({ message: 'Inventory created', item: insertRes.rows[0] });
    }

    res.json({ message: 'Inventory updated', item: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error updating inventory.' });
  }
});

module.exports = router;
