const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all patients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get patients error:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get single patient
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM patients WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get patient error:', err);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Create patient (accession, admin)
router.post('/', authenticateToken, requireRole('admin', 'accession'), async (req, res) => {
  try {
    const { name, age, gender, contact_number, address, medical_history } = req.body;

    const result = await db.query(
      `INSERT INTO patients (name, age, gender, contact_number, address, medical_history, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, age, gender, contact_number, address, medical_history, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create patient error:', err);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Update patient
router.put('/:id', authenticateToken, requireRole('admin', 'accession'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, contact_number, address, medical_history } = req.body;

    const result = await db.query(
      `UPDATE patients 
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           gender = COALESCE($3, gender),
           contact_number = COALESCE($4, contact_number),
           address = COALESCE($5, address),
           medical_history = COALESCE($6, medical_history)
       WHERE id = $7
       RETURNING *`,
      [name, age, gender, contact_number, address, medical_history, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update patient error:', err);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Delete patient (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM patients WHERE id = $1', [id]);
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

module.exports = router;
