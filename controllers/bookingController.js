const { getDB, ObjectId } = require('../config/db');

// Create Booking
exports.createBooking = async (req, res) => {
  try {
    const db = getDB();
    const { studentName, phone, tutorId, tutorName, studentEmail, sessionDate, sessionTime, notes } = req.body;

    if (!studentName || !phone || !tutorId || !tutorName || !studentEmail || !sessionDate) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const tutor = await db.collection('tutors').findOne({ _id: new ObjectId(tutorId) });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    const bookingDate = new Date(sessionDate);
    const tutorSessionDate = new Date(tutor.sessionStartDate);
    if (bookingDate < tutorSessionDate) {
      return res.status(400).json({ message: 'Booking is not available yet for this tutor' });
    }

    if (tutor.totalSlot <= 0) {
      return res.status(400).json({ message: 'No available slots left' });
    }

    const booking = {
      studentName,
      phone,
      tutorId: tutor._id,
      tutorName,
      studentEmail,
      studentId: new ObjectId(req.user.id),
      sessionDate: new Date(sessionDate),
      sessionTime: sessionTime || tutor.availableTimeSlot,
      hourlyFee: tutor.hourlyFee,
      bookStatus: 'pending',
      notes: notes || null,
      bookingDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('bookings').insertOne(booking);
    await db.collection('tutors').updateOne({ _id: tutor._id }, { $inc: { totalSlot: -1 } });

    booking._id = result.insertedId;
    return res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

// Get My Bookings
exports.getMyBookings = async (req, res) => {
  try {
    const db = getDB();
    const bookings = await db
      .collection('bookings')
      .find({ studentId: new ObjectId(req.user.id) })
      .sort({ bookingDate: -1 })
      .toArray();

    return res.status(200).json({ message: 'Your bookings retrieved successfully', count: bookings.length, bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    return res.status(500).json({ message: 'Failed to get bookings', error: error.message });
  }
};

// Get All Bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const db = getDB();
    const bookings = await db
      .collection('bookings')
      .find()
      .sort({ bookingDate: -1 })
      .toArray();

    return res.status(200).json({ message: 'All bookings retrieved successfully', count: bookings.length, bookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    return res.status(500).json({ message: 'Failed to get bookings', error: error.message });
  }
};

// Get Single Booking
exports.getBookingById = async (req, res) => {
  try {
    const db = getDB();
    const booking = await db
      .collection('bookings')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({ message: 'Booking retrieved successfully', booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ message: 'Failed to get booking', error: error.message });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const db = getDB();
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(req.params.id) });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookStatus === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    await db.collection('bookings').updateOne({ _id: booking._id }, { $set: { bookStatus: 'cancelled', updatedAt: new Date() } });
    await db.collection('tutors').updateOne({ _id: new ObjectId(booking.tutorId) }, { $inc: { totalSlot: 1 } });

    const updatedBooking = await db.collection('bookings').findOne({ _id: booking._id });
    return res.status(200).json({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
};

// Update Booking Status (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await db.collection('bookings').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { bookStatus: status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({ message: 'Booking status updated successfully', booking: result.value });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ message: 'Failed to update booking', error: error.message });
  }
};
