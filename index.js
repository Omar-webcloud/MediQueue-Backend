require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Routes
  app.get('/', (req, res) => {
    res.json({ message: 'MediQueue Server is running!' });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is healthy' });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/tutors', tutorRoutes);
  app.use('/api/bookings', bookingRoutes);

  // 404 Route
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();

module.exports = app;
// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MediQueue Server is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is healthy' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
