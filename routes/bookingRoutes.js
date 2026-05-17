const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

// Protected Routes
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);
router.get('/:id', verifyToken, getBookingById);
router.patch('/:id/cancel', verifyToken, cancelBooking);

// Admin Routes
router.get('/', verifyToken, getAllBookings);
router.patch('/:id/status', verifyToken, updateBookingStatus);

module.exports = router;
