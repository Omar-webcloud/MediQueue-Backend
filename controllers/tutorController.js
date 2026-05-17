const { getDB, ObjectId } = require('../config/db');

const parseAvailableDays = (availableDays) => {
  if (!availableDays) return [];
  if (Array.isArray(availableDays)) return availableDays;
  return String(availableDays)
    .split(/[\s,]+/)
    .map((day) => day.trim())
    .filter(Boolean);
};

// Create Tutor
exports.createTutor = async (req, res) => {
  try {
    const db = getDB();
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

    if (
      !tutorName ||
      !photo ||
      !subject ||
      !availableDays ||
      !availableTimeSlot ||
      hourlyFee === undefined ||
      totalSlot === undefined ||
      !sessionStartDate ||
      !institution ||
      !experience ||
      !location ||
      !teachingMode
    ) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const tutor = {
      tutorName,
      photo,
      subject,
      availableDays: parseAvailableDays(availableDays),
      availableTimeSlot,
      hourlyFee: Number(hourlyFee),
      totalSlot: Number(totalSlot),
      sessionStartDate: new Date(sessionStartDate),
      institution,
      experience,
      location,
      teachingMode,
      description: description || null,
      userId: new ObjectId(req.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('tutors').insertOne(tutor);
    tutor._id = result.insertedId;

    return res.status(201).json({
      message: 'Tutor created successfully',
      tutor,
    });
  } catch (error) {
    console.error('Create tutor error:', error);
    return res.status(500).json({ message: 'Failed to create tutor', error: error.message });
  }
};

// Get All Tutors with search and filter
exports.getAllTutors = async (req, res) => {
  try {
    const db = getDB();
    const { search, startDate, endDate } = req.query;
    const query = {};

    if (search) {
      query.tutorName = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      query.sessionStartDate = {};
      if (startDate) query.sessionStartDate.$gte = new Date(startDate);
      if (endDate) query.sessionStartDate.$lte = new Date(endDate);
    }

    const tutors = await db
      .collection('tutors')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

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
    const db = getDB();
    const tutor = await db.collection('tutors').findOne({ _id: new ObjectId(req.params.id) });

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
    const db = getDB();
    const tutorId = new ObjectId(req.params.id);
    const tutor = await db.collection('tutors').findOne({ _id: tutorId });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (tutor.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this tutor' });
    }

    const updates = { ...req.body, updatedAt: new Date() };
    if (updates.availableDays) {
      updates.availableDays = parseAvailableDays(updates.availableDays);
    }
    if (updates.sessionStartDate) {
      updates.sessionStartDate = new Date(updates.sessionStartDate);
    }
    if (updates.hourlyFee !== undefined) {
      updates.hourlyFee = Number(updates.hourlyFee);
    }
    if (updates.totalSlot !== undefined) {
      updates.totalSlot = Number(updates.totalSlot);
    }
    delete updates.userId;

    await db.collection('tutors').updateOne({ _id: tutorId }, { $set: updates });
    const updatedTutor = await db.collection('tutors').findOne({ _id: tutorId });

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
    const db = getDB();
    const tutorId = new ObjectId(req.params.id);
    const tutor = await db.collection('tutors').findOne({ _id: tutorId });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (tutor.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this tutor' });
    }

    await db.collection('tutors').deleteOne({ _id: tutorId });

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
    const db = getDB();
    const tutors = await db
      .collection('tutors')
      .find({ userId: new ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

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
