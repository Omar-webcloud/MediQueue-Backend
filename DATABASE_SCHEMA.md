# Database Schema Documentation

## Collections Overview

### 1. **Users Collection**
Stores user account information for students and tutors.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required for email/password auth),
  photo: String (optional, profile picture URL),
  role: String (enum: ['student', 'tutor', 'admin'], default: 'student'),
  googleId: String (optional, unique, for Google OAuth),
  isEmailVerified: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Key Points:**
- Passwords are hashed using bcryptjs before saving
- Google ID is optional for social login
- Email is unique to prevent duplicates
- Timestamps track account creation and updates

---

### 2. **Tutors Collection**
Stores tutor profile information.

**Schema:**
```javascript
{
  _id: ObjectId,
  tutorName: String (required),
  photo: String (required, image URL from imgbb/postimage),
  subject: String (required, enum: [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'History', 'Geography', 'Computer Science', 
    'Art', 'Music', 'Other'
  ]),
  availableDays: Array (required, enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
  availableTimeSlot: String (required, format: "5:00 PM - 8:00 PM"),
  hourlyFee: Number (required, min: 0),
  totalSlot: Number (required, min: 0, decreases on booking),
  sessionStartDate: Date (required, earliest date for bookings),
  institution: String (required, school/college name),
  experience: String (required, years/description of experience),
  location: String (required, area/city),
  teachingMode: String (required, enum: ['Online', 'Offline', 'Both']),
  userId: ObjectId (required, reference to User who created the tutor profile),
  description: String (optional),
  rating: Number (default: 0, min: 0, max: 5),
  totalReviews: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Key Points:**
- Each tutor is owned by a user (userId reference)
- totalSlot auto-decrements when a booking is made
- sessionStartDate prevents bookings before it
- Photo must be a direct image URL (imgbb or postimage)

---

### 3. **Bookings Collection**
Stores student session bookings with tutors.

**Schema:**
```javascript
{
  _id: ObjectId,
  studentName: String (required),
  phone: String (required),
  studentEmail: String (required, lowercase),
  tutorId: ObjectId (required, reference to Tutor),
  tutorName: String (required, denormalized for easy access),
  studentId: ObjectId (required, reference to User who booked),
  bookStatus: String (enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending'),
  sessionDate: Date (required, must be >= tutor's sessionStartDate),
  sessionTime: String (inherited from tutor's availableTimeSlot),
  hourlyFee: Number (required, copied from tutor's hourlyFee),
  bookingDate: Date (default: now, when booking was created),
  notes: String (optional, additional comments),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
```javascript
{
  studentId: 1,
  tutorId: 1
}
{
  studentEmail: 1
}
{
  bookStatus: 1
}
```

**Key Points:**
- studentId must match the logged-in user
- bookStatus tracks booking lifecycle
- sessionDate must be >= tutor's sessionStartDate
- Tutor's totalSlot decreases when booking is created
- Tutor's totalSlot increases when booking is cancelled

---

## Business Logic Rules

### Booking Creation Rules:
1. **Slot Availability Check:**
   - If `tutor.totalSlot <= 0` → Return "No available slots left"

2. **Session Date Validation:**
   - If `bookingDate < tutor.sessionStartDate` → Return "Booking is not available yet for this tutor"

3. **Slot Decrementation:**
   - On successful booking: `tutor.totalSlot -= 1`

### Booking Cancellation Rules:
1. **Slot Restoration:**
   - On cancellation: `tutor.totalSlot += 1`

2. **Status Update:**
   - Update `bookStatus` to "cancelled"

3. **Authorization:**
   - Only student who made the booking can cancel it

### Tutor Update Rules:
1. **Authorization:**
   - Only user who created the tutor can update/delete it

2. **Field Validation:**
   - All required fields must be provided
   - Subject must be from predefined enum
   - Teaching mode must be valid

---

## Query Examples

### Find all available tutors:
```javascript
Tutor.find({ totalSlot: { $gt: 0 } })
```

### Search tutors by name (case-insensitive):
```javascript
Tutor.find({ tutorName: { $regex: search, $options: 'i' } })
```

### Filter tutors by date range:
```javascript
Tutor.find({
  sessionStartDate: {
    $gte: new Date(startDate),
    $lte: new Date(endDate)
  }
})
```

### Get user's bookings:
```javascript
Booking.find({ studentId: userId })
```

### Get tutor's bookings:
```javascript
Booking.find({ tutorId: tutorId })
```

### Cancel booking:
```javascript
Booking.findByIdAndUpdate(id, { bookStatus: 'cancelled' })
```

---

## Data Validation Rules

### User Registration:
- Name: Non-empty string
- Email: Valid email format (regex validated)
- Password: Min 6 characters, must include uppercase, lowercase
- Photo: Optional, should be valid URL

### Tutor Creation:
- All fields required (except description)
- Subject from enum
- Days from enum
- Time slot format: "HH:MM AM/PM - HH:MM AM/PM"
- Fees: Non-negative number
- Total slots: Non-negative number
- Session date: Valid future date

### Booking Creation:
- Student name: Non-empty string
- Phone: Non-empty string
- Session date: Valid date >= tutor's session start date
- Check slot availability before creating

---

## Relationships

```
User (1) ──→ (Many) Tutor
  └─ User can create multiple tutor profiles
  └─ Each tutor belongs to one user

User (1) ──→ (Many) Booking
  └─ User (student) can make multiple bookings
  └─ Each booking belongs to one student

Tutor (1) ──→ (Many) Booking
  └─ Each tutor can have multiple bookings
  └─ Each booking references one tutor
```

---

## Future Enhancements

- Review and Rating system (separate collection)
- Session history and completion tracking
- Payment records (separate collection)
- User preferences and settings
- Notification system
- Analytics and reporting
