const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get single customer
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer (admin, accession)
router.post('/', authenticateToken, requireRole('admin', 'accession'), async (req, res) => {
  try {
    const { name, contact, email, location, tier } = req.body;

    const result = await db.query(
      `INSERT INTO customers (name, contact, email, location, tier)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, contact, email, location, tier || 'Silver']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, email, location, tier } = req.body;

    const result = await db.query(
      `UPDATE customers 
       SET name = COALESCE($1, name),
           contact = COALESCE($2, contact),
           email = COALESCE($3, email),
           location = COALESCE($4, location),
           tier = COALESCE($5, tier)
       WHERE id = $6
       RETURNING *`,
      [name, contact, email, location, tier, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
