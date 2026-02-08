const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all pricing tiers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pricing_tiers ORDER BY tier_name');
    res.json(result.rows);
  } catch (err) {
    console.error('Get pricing tiers error:', err);
    res.status(500).json({ error: 'Failed to fetch pricing tiers' });
  }
});

// Update pricing tier (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { lbc_price, hpv_price, co_test_price } = req.body;

    const result = await db.query(
      `UPDATE pricing_tiers 
       SET lbc_price = COALESCE($1, lbc_price),
           hpv_price = COALESCE($2, hpv_price),
           co_test_price = COALESCE($3, co_test_price)
       WHERE id = $4
       RETURNING *`,
      [lbc_price, hpv_price, co_test_price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing tier not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update pricing tier error:', err);
    res.status(500).json({ error: 'Failed to update pricing tier' });
  }
});

module.exports = router;
