const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all samples
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, assigned_technician, assigned_pathologist } = req.query;
    
    let query = `
      SELECT s.*, 
             p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
             c.name as customer_display_name, c.tier as customer_tier
      FROM samples s
      LEFT JOIN patients p ON s.patient_id = p.id
      LEFT JOIN customers c ON s.customer_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status) {
      params.push(status);
      conditions.push(`s.status = $${params.length}`);
    }
    
    if (assigned_technician) {
      params.push(assigned_technician);
      conditions.push(`s.assigned_technician = $${params.length}`);
    }
    
    if (assigned_pathologist) {
      params.push(assigned_pathologist);
      conditions.push(`s.assigned_pathologist = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get samples error:', err);
    res.status(500).json({ error: 'Failed to fetch samples' });
  }
});

// Get single sample
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT s.*, 
              p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
              c.name as customer_display_name
       FROM samples s
       LEFT JOIN patients p ON s.patient_id = p.id
       LEFT JOIN customers c ON s.customer_id = c.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get sample error:', err);
    res.status(500).json({ error: 'Failed to fetch sample' });
  }
});

// Create sample (accession, admin)
router.post('/', authenticateToken, requireRole('admin', 'accession'), async (req, res) => {
  try {
    const { barcode, test_type, customer_id, customer_name, patient_id, lab_id, processing_notes } = req.body;

    const result = await db.query(
      `INSERT INTO samples (barcode, test_type, customer_id, customer_name, patient_id, lab_id, processing_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [barcode, test_type, customer_id, customer_name, patient_id, lab_id, processing_notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create sample error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Barcode already exists' });
    }
    res.status(500).json({ error: 'Failed to create sample' });
  }
});

// Update sample
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_technician, assigned_pathologist, processing_notes } = req.body;

    const result = await db.query(
      `UPDATE samples 
       SET status = COALESCE($1, status),
           assigned_technician = COALESCE($2, assigned_technician),
           assigned_pathologist = COALESCE($3, assigned_pathologist),
           processing_notes = COALESCE($4, processing_notes)
       WHERE id = $5
       RETURNING *`,
      [status, assigned_technician, assigned_pathologist, processing_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update sample error:', err);
    res.status(500).json({ error: 'Failed to update sample' });
  }
});

// Pickup sample (technician assigns themselves)
router.post('/:id/pickup', authenticateToken, requireRole('technician'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE samples 
       SET assigned_technician = $1, status = 'processing'
       WHERE id = $2 AND status = 'pending' AND assigned_technician IS NULL
       RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Sample not available for pickup' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Pickup sample error:', err);
    res.status(500).json({ error: 'Failed to pickup sample' });
  }
});

// Delete sample (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM samples WHERE id = $1', [id]);
    res.json({ message: 'Sample deleted successfully' });
  } catch (err) {
    console.error('Delete sample error:', err);
    res.status(500).json({ error: 'Failed to delete sample' });
  }
});

module.exports = router;
