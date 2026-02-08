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
ensureDir(path.join(STORAGE_PATH, 'temp'));

// Configure multer for LARGE file uploads (2GB+ support)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || 'slides';
    const uploadPath = path.join(STORAGE_PATH, uploadType);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Preserve original extension for pathology formats
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024 * 1024, // 3GB limit for large slide images
  },
  fileFilter: (req, file, cb) => {
    // Allowed pathology image formats
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp',
      '.svs', '.ndpi', '.vsi', '.scn', '.mrxs', '.bif',  // Whole slide formats
      '.dcm', '.dicom',  // DICOM
      '.pdf'
    ];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${ext}. Allowed: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

// Upload progress tracking
const uploadProgress = new Map();

// Upload slide image (supports large NDPI/TIFF files)
router.post('/slide', authenticateToken, requireRole('technician', 'admin'), (req, res) => {
  const uploadId = uuidv4();
  
  // Track upload progress
  req.on('data', (chunk) => {
    const current = uploadProgress.get(uploadId) || 0;
    uploadProgress.set(uploadId, current + chunk.length);
  });

  upload.single('file')(req, res, async (err) => {
    uploadProgress.delete(uploadId);
    
    if (err) {
      console.error('Upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 3GB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { sample_id, tile_name } = req.body;
      const filePath = `/storage/slides/${req.file.filename}`;
      const ext = path.extname(req.file.originalname).toLowerCase();

      // Insert into database
      const result = await db.query(
        `INSERT INTO slide_images (sample_id, user_id, file_name, file_path, file_size, mime_type, tile_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          sample_id || null, 
          req.user.id, 
          req.file.originalname, 
          filePath, 
          req.file.size, 
          req.file.mimetype || getMimeType(ext),
          tile_name || null
        ]
      );

      console.log(`Uploaded: ${req.file.originalname} (${formatFileSize(req.file.size)})`);

      res.status(201).json({
        ...result.rows[0],
        url: filePath,
        size_formatted: formatFileSize(req.file.size)
      });
    } catch (err) {
      console.error('Database error:', err);
      // Clean up uploaded file on database error
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      res.status(500).json({ error: 'Failed to save slide information' });
    }
  });
});

// Chunked upload endpoint for very large files
router.post('/slide/chunk', authenticateToken, requireRole('technician', 'admin'), upload.single('chunk'), async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, fileName, sampleId } = req.body;
    
    if (!req.file || !uploadId || chunkIndex === undefined || !totalChunks) {
      return res.status(400).json({ error: 'Missing required chunk parameters' });
    }

    const tempDir = path.join(STORAGE_PATH, 'temp', uploadId);
    ensureDir(tempDir);
    
    // Move chunk to temp directory
    const chunkPath = path.join(tempDir, `chunk_${chunkIndex.toString().padStart(5, '0')}`);
    fs.renameSync(req.file.path, chunkPath);

    // Check if all chunks are uploaded
    const chunks = fs.readdirSync(tempDir);
    
    if (chunks.length === parseInt(totalChunks)) {
      // All chunks received, merge them
      const ext = path.extname(fileName).toLowerCase();
      const finalFileName = `${uuidv4()}${ext}`;
      const finalPath = path.join(STORAGE_PATH, 'slides', finalFileName);
      
      // Create write stream for final file
      const writeStream = fs.createWriteStream(finalPath);
      
      // Sort and merge chunks
      const sortedChunks = chunks.sort();
      for (const chunk of sortedChunks) {
        const chunkData = fs.readFileSync(path.join(tempDir, chunk));
        writeStream.write(chunkData);
      }
      writeStream.end();

      // Wait for write to complete
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // Get file size
      const stats = fs.statSync(finalPath);
      
      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });

      // Save to database
      const result = await db.query(
        `INSERT INTO slide_images (sample_id, user_id, file_name, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          sampleId || null,
          req.user.id,
          fileName,
          `/storage/slides/${finalFileName}`,
          stats.size,
          getMimeType(ext)
        ]
      );

      console.log(`Chunked upload complete: ${fileName} (${formatFileSize(stats.size)})`);

      return res.status(201).json({
        ...result.rows[0],
        url: `/storage/slides/${finalFileName}`,
        size_formatted: formatFileSize(stats.size),
        complete: true
      });
    }

    res.json({ 
      uploaded: chunks.length, 
      total: parseInt(totalChunks),
      complete: false
    });
  } catch (err) {
    console.error('Chunk upload error:', err);
    res.status(500).json({ error: 'Failed to process chunk' });
  }
});

// Get upload progress
router.get('/progress/:uploadId', authenticateToken, (req, res) => {
  const progress = uploadProgress.get(req.params.uploadId) || 0;
  res.json({ bytes: progress });
});

// Upload report PDF
router.post('/report', authenticateToken, requireRole('pathologist', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { test_result_id } = req.body;
    const filePath = `/storage/reports/${req.file.filename}`;

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

// Get all slides (for pathologist view)
router.get('/slides', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT si.*, s.barcode, s.customer_name, s.status as sample_status
      FROM slide_images si
      LEFT JOIN samples s ON si.sample_id = s.id
      ORDER BY si.uploaded_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get all slides error:', err);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

// Stream slide file (for viewing)
router.get('/view/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT file_path, file_name, mime_type FROM slide_images WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    const slide = result.rows[0];
    const fullPath = path.join(STORAGE_PATH, '..', slide.file_path);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    const stat = fs.statSync(fullPath);
    
    // Support range requests for large files
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      
      const stream = fs.createReadStream(fullPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': slide.mime_type || 'application/octet-stream',
      });
      
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': slide.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${slide.file_name}"`,
      });
      
      fs.createReadStream(fullPath).pipe(res);
    }
  } catch (err) {
    console.error('View slide error:', err);
    res.status(500).json({ error: 'Failed to stream slide' });
  }
});

// Delete slide image
router.delete('/slide/:id', authenticateToken, requireRole('technician', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT file_path FROM slide_images WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    const fullPath = path.join(STORAGE_PATH, '..', result.rows[0].file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await db.query('DELETE FROM slide_images WHERE id = $1', [id]);
    
    res.json({ message: 'Slide deleted successfully' });
  } catch (err) {
    console.error('Delete slide error:', err);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

// Helper functions
function getMimeType(ext) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.webp': 'image/webp',
    '.svs': 'image/x-svs',
    '.ndpi': 'image/x-ndpi',
    '.vsi': 'image/x-vsi',
    '.scn': 'image/x-scn',
    '.mrxs': 'image/x-mrxs',
    '.bif': 'image/x-bif',
    '.dcm': 'application/dicom',
    '.dicom': 'application/dicom',
    '.pdf': 'application/pdf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;
