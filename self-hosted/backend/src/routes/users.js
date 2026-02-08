const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, lab_location, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get users by role
router.get('/role/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const result = await db.query(
      'SELECT id, email, name, role, lab_location FROM users WHERE role = $1 AND is_active = true ORDER BY name',
      [role]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get users by role error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, email, name, role, lab_location, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, name, role, lab_location } = req.body;

    // Check if email exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password || 'Password@1', 10);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, role, lab_location) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name, role, lab_location, is_active, created_at`,
      [email.toLowerCase(), password_hash, name, role, lab_location]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, lab_location, is_active } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           role = COALESCE($2, role), 
           lab_location = COALESCE($3, lab_location),
           is_active = COALESCE($4, is_active)
       WHERE id = $5 
       RETURNING id, email, name, role, lab_location, is_active, updated_at`,
      [name, role, lab_location, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Reset user password (admin only)
router.post('/:id/reset-password', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const password_hash = await bcrypt.hash(password || 'Password@1', 10);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, id]);

    // Invalidate all sessions
    await db.query('DELETE FROM sessions WHERE user_id = $1', [id]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-delete
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
