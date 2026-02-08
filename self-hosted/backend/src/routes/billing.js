const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all billing records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { customer_id, payment_status } = req.query;
    
    let query = `
      SELECT br.*, 
             s.barcode, s.customer_name,
             c.name as customer_display_name, c.tier
      FROM billing_records br
      LEFT JOIN samples s ON br.sample_id = s.id
      LEFT JOIN customers c ON br.customer_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (customer_id) {
      params.push(customer_id);
      conditions.push(`br.customer_id = $${params.length}`);
    }
    
    if (payment_status) {
      params.push(payment_status);
      conditions.push(`br.payment_status = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY br.billing_date DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get billing records error:', err);
    res.status(500).json({ error: 'Failed to fetch billing records' });
  }
});

// Get billing summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_records,
        SUM(amount) as total_amount,
        SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count
      FROM billing_records
    `);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get billing summary error:', err);
    res.status(500).json({ error: 'Failed to fetch billing summary' });
  }
});

// Update payment status (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const result = await db.query(
      `UPDATE billing_records 
       SET payment_status = $1
       WHERE id = $2
       RETURNING *`,
      [payment_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update billing record error:', err);
    res.status(500).json({ error: 'Failed to update billing record' });
  }
});

module.exports = router;
