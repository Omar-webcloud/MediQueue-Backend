const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    studentEmail: {
      type: String,
      required: [true, 'Student email is required'],
      lowercase: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tutor',
      required: [true, 'Tutor ID is required'],
    },
    tutorName: {
      type: String,
      required: [true, 'Tutor name is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    bookStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    sessionDate: {
      type: Date,
      required: [true, 'Session date is required'],
    },
    sessionTime: {
      type: String,
      // Format: "5:00 PM - 8:00 PM"
    },
    hourlyFee: {
      type: Number,
      required: [true, 'Hourly fee is required'],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
bookingSchema.index({ studentId: 1, tutorId: 1 });
bookingSchema.index({ studentEmail: 1 });
bookingSchema.index({ bookStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
