const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, '../../storage');

// Ensure storage directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(path.join(STORAGE_PATH, 'slides'));
ensureDir(path.join(STORAGE_PATH, 'reports'));
ensureDir(path.join(STORAGE_PATH, 'tiles'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || 'slides';
    const uploadPath = path.join(STORAGE_PATH, uploadType);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for large slide images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/tiff', 'image/webp',
      'application/pdf', 
      'image/svs', 'image/ndpi', // Whole slide image formats
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload slide image
router.post('/slide', authenticateToken, requireRole('technician', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { sample_id, tile_name } = req.body;
    const filePath = `/storage/slides/${req.file.filename}`;

    const result = await db.query(
      `INSERT INTO slide_images (sample_id, user_id, file_name, file_path, file_size, mime_type, tile_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sample_id, req.user.id, req.file.originalname, filePath, req.file.size, req.file.mimetype, tile_name]
    );

    res.status(201).json({
      ...result.rows[0],
      url: filePath
    });
  } catch (err) {
    console.error('Upload slide error:', err);
    res.status(500).json({ error: 'Failed to upload slide' });
  }
});

// Upload report PDF
router.post('/report', authenticateToken, requireRole('pathologist', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { test_result_id } = req.body;
    const filePath = `/storage/reports/${req.file.filename}`;

    // Update test result with report URL
    if (test_result_id) {
      await db.query(
        'UPDATE test_results SET report_url = $1, report_generated = true WHERE id = $2',
        [filePath, test_result_id]
      );
    }

    res.status(201).json({
      url: filePath,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Upload report error:', err);
    res.status(500).json({ error: 'Failed to upload report' });
  }
});

// Get slide images for a sample
router.get('/slides/:sampleId', authenticateToken, async (req, res) => {
  try {
    const { sampleId } = req.params;
    const result = await db.query(
      'SELECT * FROM slide_images WHERE sample_id = $1 ORDER BY uploaded_at DESC',
      [sampleId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get slides error:', err);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

// Delete slide image
router.delete('/slide/:id', authenticateToken, requireRole('technician', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file path
    const result = await db.query('SELECT file_path FROM slide_images WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    // Delete file from disk
    const fullPath = path.join(STORAGE_PATH, '..', result.rows[0].file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Delete from database
    await db.query('DELETE FROM slide_images WHERE id = $1', [id]);
    
    res.json({ message: 'Slide deleted successfully' });
  } catch (err) {
    console.error('Delete slide error:', err);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

module.exports = router;
