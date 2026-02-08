const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all lab locations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM lab_locations ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Get lab locations error:', err);
    res.status(500).json({ error: 'Failed to fetch lab locations' });
  }
});

// Get single lab location
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM lab_locations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lab location not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get lab location error:', err);
    res.status(500).json({ error: 'Failed to fetch lab location' });
  }
});

// Create lab location (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, address, contact_info, active } = req.body;

    const result = await db.query(
      `INSERT INTO lab_locations (name, address, contact_info, active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, address, contact_info, active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create lab location error:', err);
    res.status(500).json({ error: 'Failed to create lab location' });
  }
});

// Update lab location (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contact_info, active } = req.body;

    const result = await db.query(
      `UPDATE lab_locations 
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           contact_info = COALESCE($3, contact_info),
           active = COALESCE($4, active)
       WHERE id = $5
       RETURNING *`,
      [name, address, contact_info, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lab location not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update lab location error:', err);
    res.status(500).json({ error: 'Failed to update lab location' });
  }
});

// Delete lab location (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM lab_locations WHERE id = $1', [id]);
    res.json({ message: 'Lab location deleted successfully' });
  } catch (err) {
    console.error('Delete lab location error:', err);
    res.status(500).json({ error: 'Failed to delete lab location' });
  }
});

module.exports = router;
