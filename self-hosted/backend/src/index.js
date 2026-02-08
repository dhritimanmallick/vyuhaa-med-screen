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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from storage
app.use('/storage', express.static(path.join(__dirname, '../storage')));

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
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Vyuhaa Backend API running on port ${PORT}`);
});
