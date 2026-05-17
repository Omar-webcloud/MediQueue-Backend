const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');

// Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { studentName, phone, tutorId, tutorName, studentEmail, sessionDate, sessionTime, notes } = req.body;

    // Validate required fields
    if (!studentName || !phone || !tutorId || !tutorName || !studentEmail || !sessionDate) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Get tutor details
    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check if session date is before tutor's session start date
    const bookingDate = new Date(sessionDate);
    const tutorSessionDate = new Date(tutor.sessionStartDate);

    if (bookingDate < tutorSessionDate) {
      return res.status(400).json({
        message: 'Booking is not available yet for this tutor',
      });
    }

    // Check if slots are available
    if (tutor.totalSlot <= 0) {
      return res.status(400).json({
        message: 'No available slots left',
      });
    }

    // Create booking
    const newBooking = new Booking({
      studentName,
      phone,
      tutorId,
      tutorName,
      studentEmail,
      studentId: req.user.id,
      sessionDate,
      sessionTime: sessionTime || tutor.availableTimeSlot,
      hourlyFee: tutor.hourlyFee,
      bookStatus: 'pending',
      notes,
    });

    await newBooking.save();

    // Decrease tutor's total slot
    tutor.totalSlot -= 1;
    await tutor.save();

    return res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

// Get My Bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate('tutorId', 'tutorName subject hourlyFee')
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      message: 'Your bookings retrieved successfully',
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    return res.status(500).json({ message: 'Failed to get bookings', error: error.message });
  }
};

// Get All Bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('tutorId', 'tutorName subject')
      .populate('studentId', 'name email')
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      message: 'All bookings retrieved successfully',
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    return res.status(500).json({ message: 'Failed to get bookings', error: error.message });
  }
};

// Get Single Booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tutorId')
      .populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({
      message: 'Booking retrieved successfully',
      booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ message: 'Failed to get booking', error: error.message });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking is already cancelled
    if (booking.bookStatus === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.bookStatus = 'cancelled';
    await booking.save();

    // Restore tutor's slot
    const tutor = await Tutor.findById(booking.tutorId);
    if (tutor) {
      tutor.totalSlot += 1;
      await tutor.save();
    }

    return res.status(200).json({
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
};

// Update Booking Status (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookStatus: status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ message: 'Failed to update booking', error: error.message });
  }
};
