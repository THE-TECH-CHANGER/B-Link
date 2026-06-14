require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Import Routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

// Basic route to check if server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BloodLink Backend is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`BloodLink Server running on port ${port}`);
});
