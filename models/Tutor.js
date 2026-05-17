const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema(
  {
    tutorName: {
      type: String,
      required: [true, 'Tutor name is required'],
      trim: true,
    },
    photo: {
      type: String,
      required: [true, 'Tutor photo is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'History',
        'Geography',
        'Computer Science',
        'Art',
        'Music',
        'Other',
      ],
    },
    availableDays: {
      type: [String],
      required: [true, 'Available days are required'],
      enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    availableTimeSlot: {
      type: String,
      required: [true, 'Available time slot is required'],
      // Format: "5:00 PM - 8:00 PM"
    },
    hourlyFee: {
      type: Number,
      required: [true, 'Hourly fee is required'],
      min: 0,
    },
    totalSlot: {
      type: Number,
      required: [true, 'Total slot is required'],
      min: 0,
    },
    sessionStartDate: {
      type: Date,
      required: [true, 'Session start date is required'],
    },
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    teachingMode: {
      type: String,
      required: [true, 'Teaching mode is required'],
      enum: ['Online', 'Offline', 'Both'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tutor', tutorSchema);
