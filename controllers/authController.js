const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getDB, ObjectId } = require('../config/db');

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${derivedKey}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return derivedKey === key;
};

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required in environment variables');
}

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role || 'student' },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register Controller
exports.register = async (req, res) => {
  try {
    const { name, email, password, photo } = req.body;
    const db = getDB();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = hashPassword(password);
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      photo: photo || null,
      role: 'student',
      googleId: null,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertedId.toString(),
        name,
        email,
        photo: photo || null,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Google Login/Register Controller
exports.googleAuth = async (req, res) => {
  try {
    const { name, email, photo, googleId } = req.body;
    const db = getDB();

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Google authentication requires email and googleId' });
    }

    let user = await db.collection('users').findOne({ email });
    if (!user) {
      const result = await db.collection('users').insertOne({
        name,
        email,
        photo: photo || null,
        password: null,
        role: 'student',
        googleId,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await db.collection('users').findOne({ _id: result.insertedId });
    } else if (!user.googleId) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { googleId, photo: photo || user.photo, updatedAt: new Date() } }
      );
      user = await db.collection('users').findOne({ _id: user._id });
    }

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};

// Logout Controller
exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;
    const db = getDB();
    if (!name && !photo) {
      return res.status(400).json({ message: 'Name or photo is required to update profile' });
    }
    const updates = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (photo) updates.photo = photo;
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: updates }
    );
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};
