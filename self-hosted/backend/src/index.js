const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const samplesRoutes = require('./routes/samples');
const patientsRoutes = require('./routes/patients');
const customersRoutes = require('./routes/customers');
const testResultsRoutes = require('./routes/testResults');
const billingRoutes = require('./routes/billing');
const uploadRoutes = require('./routes/upload');
const pricingRoutes = require('./routes/pricing');
const labLocationsRoutes = require('./routes/labLocations');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for accurate client IP
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Increase payload limits for large file metadata
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request timeout for large uploads (1 hour)
app.use((req, res, next) => {
  req.setTimeout(3600000); // 1 hour
  res.setTimeout(3600000);
  next();
});

// Serve static files from storage
app.use('/storage', express.static(path.join(__dirname, '../storage'), {
  // Enable range requests for large file streaming
  acceptRanges: true,
  // Cache control
  maxAge: '1d',
  etag: true,
  lastModified: true,
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/samples', samplesRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/test-results', testResultsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/lab-locations', labLocationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large. Maximum size is 3GB.'
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Create storage directories
const fs = require('fs');
const storagePath = process.env.STORAGE_PATH || path.join(__dirname, '../storage');
['slides', 'reports', 'tiles', 'temp'].forEach(dir => {
  const fullPath = path.join(storagePath, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});

app.listen(PORT, () => {
  console.log(`Vyuhaa Backend API running on port ${PORT}`);
  console.log(`Storage path: ${storagePath}`);
  console.log(`Max upload size: 3GB`);
});
