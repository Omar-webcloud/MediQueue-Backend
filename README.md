# MediQueue Server

MediQueue is a tutor booking system backend API. This is the Node.js/Express backend server that handles authentication, tutor management, and booking operations.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Omar-webcloud/MediQueue-Backend.git
cd MediQueue-Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mediqueue
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user with email and password
- `POST /google-auth` - Authenticate with Google
- `POST /logout` - Logout user (protected)
- `GET /current-user` - Get current user info (protected)

### Tutor Routes (`/api/tutors`)
- `GET /` - Get all tutors (with search and filter)
- `GET /:id` - Get specific tutor details
- `POST /` - Create new tutor (protected)
- `PUT /:id` - Update tutor (protected, owner only)
- `DELETE /:id` - Delete tutor (protected, owner only)
- `GET /my-tutors/list` - Get user's tutors (protected)

### Booking Routes (`/api/bookings`)
- `POST /` - Create new booking (protected)
- `GET /my-bookings` - Get user's bookings (protected)
- `GET /:id` - Get specific booking (protected)
- `PATCH /:id/cancel` - Cancel booking (protected)
- `PATCH /:id/status` - Update booking status (admin)

## Database Models

### User Schema
- `name` - User's full name
- `email` - User's email (unique)
- `password` - Hashed password
- `photo` - User's profile photo URL
- `role` - User role (student/tutor/admin)
- `googleId` - Google ID for social login
- `isEmailVerified` - Email verification status
- `timestamps` - Created and updated dates

### Tutor Schema
- `tutorName` - Tutor's name
- `photo` - Tutor's photo URL
- `subject` - Subject taught (Math, Physics, etc.)
- `availableDays` - Days available (Sun-Sat)
- `availableTimeSlot` - Time slot (e.g., "5:00 PM - 8:00 PM")
- `hourlyFee` - Hourly rate
- `totalSlot` - Total available slots
- `sessionStartDate` - When sessions start
- `institution` - Institution name
- `experience` - Years of experience
- `location` - Teaching location
- `teachingMode` - Online/Offline/Both
- `userId` - Reference to User (tutor owner)
- `rating` - Tutor rating
- `totalReviews` - Number of reviews
- `timestamps` - Created and updated dates

### Booking Schema
- `studentName` - Student's name
- `phone` - Student's phone number
- `studentEmail` - Student's email
- `tutorId` - Reference to Tutor
- `tutorName` - Tutor's name (denormalized)
- `studentId` - Reference to User (student)
- `bookStatus` - Status (pending/confirmed/completed/cancelled)
- `sessionDate` - Booked session date
- `sessionTime` - Session time slot
- `hourlyFee` - Fee for the session
- `bookingDate` - When booking was made
- `notes` - Additional notes
- `timestamps` - Created and updated dates

## Key Features

✅ JWT Authentication with email/password and Google OAuth  
✅ User management with roles (student/tutor/admin)  
✅ Tutor profile creation and management  
✅ Session booking with slot management  
✅ Search and filter functionality for tutors  
✅ Automatic slot management on booking/cancellation  
✅ Session date validation  
✅ Protected routes with token verification  

## Folder Structure

```
mediqueue-server/
├── config/
│   └── db.js              # Database connection
├── models/
│   ├── User.js            # User schema
│   ├── Tutor.js           # Tutor schema
│   └── Booking.js         # Booking schema
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── tutorController.js # Tutor management logic
│   └── bookingController.js # Booking logic
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── tutorRoutes.js     # Tutor endpoints
│   └── bookingRoutes.js   # Booking endpoints
├── middleware/
│   └── auth.js            # JWT verification
├── .env                   # Environment variables
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
└── index.js               # Server entry point
```

## Error Handling

The API returns proper HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- CORS enabled for client requests
- HTTP-only cookies for token storage
- Environment variables for sensitive data

## Future Enhancements

- Email verification
- Password reset functionality
- User reviews and ratings
- Payment integration
- Email notifications
- Advanced filtering options

## License

ISC

## Author

Omar Webcloud
