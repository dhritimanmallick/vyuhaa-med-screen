const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all test results
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { sample_id } = req.query;
    
    let query = `
      SELECT tr.*, 
             s.barcode, s.test_type, s.customer_name, s.status as sample_status,
             p.name as patient_name
      FROM test_results tr
      LEFT JOIN samples s ON tr.sample_id = s.id
      LEFT JOIN patients p ON tr.patient_id = p.id
    `;
    
    const params = [];
    if (sample_id) {
      params.push(sample_id);
      query += ' WHERE tr.sample_id = $1';
    }
    
    query += ' ORDER BY tr.created_at DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get test results error:', err);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

// Get single test result
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT tr.*, 
              s.barcode, s.test_type, s.customer_name,
              p.name as patient_name
       FROM test_results tr
       LEFT JOIN samples s ON tr.sample_id = s.id
       LEFT JOIN patients p ON tr.patient_id = p.id
       WHERE tr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test result not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get test result error:', err);
    res.status(500).json({ error: 'Failed to fetch test result' });
  }
});

// Create test result
router.post('/', authenticateToken, requireRole('technician', 'pathologist', 'admin'), async (req, res) => {
  try {
    const { sample_id, patient_id, test_findings, diagnosis, recommendations, images_uploaded } = req.body;

    const result = await db.query(
      `INSERT INTO test_results (sample_id, patient_id, test_findings, diagnosis, recommendations, images_uploaded, completed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sample_id, patient_id, test_findings, diagnosis, recommendations, images_uploaded || false, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create test result error:', err);
    res.status(500).json({ error: 'Failed to create test result' });
  }
});

// Update test result
router.put('/:id', authenticateToken, requireRole('technician', 'pathologist', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      test_findings, 
      diagnosis, 
      recommendations, 
      images_uploaded, 
      report_generated, 
      report_url,
      report_sent_at,
      report_sent_to 
    } = req.body;

    const result = await db.query(
      `UPDATE test_results 
       SET test_findings = COALESCE($1, test_findings),
           diagnosis = COALESCE($2, diagnosis),
           recommendations = COALESCE($3, recommendations),
           images_uploaded = COALESCE($4, images_uploaded),
           report_generated = COALESCE($5, report_generated),
           report_url = COALESCE($6, report_url),
           report_sent_at = COALESCE($7, report_sent_at),
           report_sent_to = COALESCE($8, report_sent_to),
           reviewed_by = $9
       WHERE id = $10
       RETURNING *`,
      [test_findings, diagnosis, recommendations, images_uploaded, report_generated, report_url, report_sent_at, report_sent_to, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test result not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update test result error:', err);
    res.status(500).json({ error: 'Failed to update test result' });
  }
});

// Delete test result (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM test_results WHERE id = $1', [id]);
    res.json({ message: 'Test result deleted successfully' });
  } catch (err) {
    console.error('Delete test result error:', err);
    res.status(500).json({ error: 'Failed to delete test result' });
  }
});

module.exports = router;
