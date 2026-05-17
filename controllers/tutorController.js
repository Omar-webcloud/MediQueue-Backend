const Tutor = require('../models/Tutor');

// Create Tutor
exports.createTutor = async (req, res) => {
  try {
    const {
      tutorName,
      photo,
      subject,
      availableDays,
      availableTimeSlot,
      hourlyFee,
      totalSlot,
      sessionStartDate,
      institution,
      experience,
      location,
      teachingMode,
      description,
    } = req.body;

    // Validate required fields
    if (
      !tutorName ||
      !photo ||
      !subject ||
      !availableDays ||
      !availableTimeSlot ||
      !hourlyFee ||
      !totalSlot ||
      !sessionStartDate ||
      !institution ||
      !experience ||
      !location ||
      !teachingMode
    ) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const newTutor = new Tutor({
      tutorName,
      photo,
      subject,
      availableDays,
      availableTimeSlot,
      hourlyFee,
      totalSlot,
      sessionStartDate,
      institution,
      experience,
      location,
      teachingMode,
      description,
      userId: req.user.id,
    });

    await newTutor.save();

    return res.status(201).json({
      message: 'Tutor created successfully',
      tutor: newTutor,
    });
  } catch (error) {
    console.error('Create tutor error:', error);
    return res.status(500).json({ message: 'Failed to create tutor', error: error.message });
  }
};

// Get All Tutors with search and filter
exports.getAllTutors = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    let query = {};

    // Search by tutor name (case-insensitive)
    if (search) {
      query.tutorName = { $regex: search, $options: 'i' };
    }

    // Filter by session start date
    if (startDate || endDate) {
      query.sessionStartDate = {};
      if (startDate) {
        query.sessionStartDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.sessionStartDate.$lte = new Date(endDate);
      }
    }

    const tutors = await Tutor.find(query).populate('userId', 'name email photo').limit(100);

    return res.status(200).json({
      message: 'Tutors retrieved successfully',
      count: tutors.length,
      tutors,
    });
  } catch (error) {
    console.error('Get tutors error:', error);
    return res.status(500).json({ message: 'Failed to get tutors', error: error.message });
  }
};

// Get Single Tutor
exports.getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id).populate('userId', 'name email photo');

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    return res.status(200).json({
      message: 'Tutor retrieved successfully',
      tutor,
    });
  } catch (error) {
    console.error('Get tutor error:', error);
    return res.status(500).json({ message: 'Failed to get tutor', error: error.message });
  }
};

// Update Tutor
exports.updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check authorization
    if (tutor.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this tutor' });
    }

    // Update fields
    const updatedTutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Tutor updated successfully',
      tutor: updatedTutor,
    });
  } catch (error) {
    console.error('Update tutor error:', error);
    return res.status(500).json({ message: 'Failed to update tutor', error: error.message });
  }
};

// Delete Tutor
exports.deleteTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check authorization
    if (tutor.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this tutor' });
    }

    await Tutor.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: 'Tutor deleted successfully',
    });
  } catch (error) {
    console.error('Delete tutor error:', error);
    return res.status(500).json({ message: 'Failed to delete tutor', error: error.message });
  }
};

// Get My Tutors
exports.getMyTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({ userId: req.user.id });

    return res.status(200).json({
      message: 'Your tutors retrieved successfully',
      count: tutors.length,
      tutors,
    });
  } catch (error) {
    console.error('Get my tutors error:', error);
    return res.status(500).json({ message: 'Failed to get your tutors', error: error.message });
  }
};
