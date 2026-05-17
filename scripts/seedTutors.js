require('dotenv').config();
const { connectDB, getDB, ObjectId } = require('../config/db');
const crypto = require('crypto');

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${derivedKey}`;
};

const tutorsData = [
  {
    tutorName: 'Rafiqul Islam',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    subject: 'Mathematics',
    availableDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    availableTimeSlot: '5:00 PM - 8:00 PM',
    hourlyFee: 800,
    totalSlot: 5,
    sessionStartDate: new Date('2026-06-01'),
    institution: 'BUET (Bangladesh University of Engineering and Technology)',
    experience: '4 Years of teaching experience in HSC & Admission Math.',
    location: 'Dhanmondi, Dhaka',
    teachingMode: 'Both',
    description: 'Specialized in advanced Calculus, Coordinate Geometry, and Algebra. Helping students ace their board exams and university admission tests.',
    rating: 4.8,
    totalReviews: 24
  },
  {
    tutorName: 'Nusrat Jahan',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    subject: 'Biology',
    availableDays: ['Mon', 'Wed', 'Fri'],
    availableTimeSlot: '3:00 PM - 5:00 PM',
    hourlyFee: 700,
    totalSlot: 4,
    sessionStartDate: new Date('2026-06-05'),
    institution: 'DMC (Dhaka Medical College)',
    experience: '3 Years tutoring HSC and Medical Admission Biology.',
    location: 'Farmgate, Dhaka',
    teachingMode: 'Offline',
    description: 'Providing in-depth conceptual clarity on Human Physiology, Genetics, and Plant Anatomy. Focused on active learning and diagrammatic explanations.',
    rating: 4.9,
    totalReviews: 18
  },
  {
    tutorName: 'Tanvir Rahman',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
    subject: 'Physics',
    availableDays: ['Sun', 'Tue', 'Thu'],
    availableTimeSlot: '6:00 PM - 8:30 PM',
    hourlyFee: 1000,
    totalSlot: 3,
    sessionStartDate: new Date('2026-05-25'),
    institution: 'Dhaka University (DU)',
    experience: '5 Years in teaching Physics to A-Levels and HSC students.',
    location: 'Uttara, Dhaka',
    teachingMode: 'Both',
    description: 'Specialist in Newtonian Mechanics, Electromagnetism, and Modern Physics. Master the math and theories behind physical systems.',
    rating: 4.7,
    totalReviews: 32
  },
  {
    tutorName: 'Fahmida Akter',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop',
    subject: 'Chemistry',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    availableTimeSlot: '4:00 PM - 6:00 PM',
    hourlyFee: 750,
    totalSlot: 6,
    sessionStartDate: new Date('2026-06-02'),
    institution: 'Jahangirnagar University (JU)',
    experience: '3 Years of teaching Organic and Inorganic Chemistry.',
    location: 'Mirpur, Dhaka',
    teachingMode: 'Online',
    description: 'Simplifying complex Organic reaction mechanisms, Chemical bonds, and Stoichiometry. Custom mock tests and interactive visual slides included.',
    rating: 4.6,
    totalReviews: 15
  },
  {
    tutorName: 'Sadia Sultana',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
    subject: 'English',
    availableDays: ['Sat', 'Mon', 'Wed'],
    availableTimeSlot: '7:00 PM - 9:00 PM',
    hourlyFee: 600,
    totalSlot: 8,
    sessionStartDate: new Date('2026-06-10'),
    institution: 'NSU (North South University)',
    experience: '2 Years tutoring IELTS preparation and HSC English Grammar.',
    location: 'Banani, Dhaka',
    teachingMode: 'Online',
    description: 'Focused on enhancing speaking fluency, writing accuracy, and reading comprehension. Friendly environment for intermediate to advanced students.',
    rating: 4.5,
    totalReviews: 12
  },
  {
    tutorName: 'Abrar Fahim',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop',
    subject: 'Computer Science',
    availableDays: ['Fri', 'Sat'],
    availableTimeSlot: '9:00 AM - 12:00 PM',
    hourlyFee: 1200,
    totalSlot: 5,
    sessionStartDate: new Date('2026-05-28'),
    institution: 'IUT (Islamic University of Technology)',
    experience: '4 Years teaching Web Development, Python, and C++ to beginners.',
    location: 'Gazipur, Dhaka',
    teachingMode: 'Both',
    description: 'Learn programming logic, Data Structures, and algorithms from scratch. Hands-on coding sessions and real-world projects.',
    rating: 4.9,
    totalReviews: 29
  },
  {
    tutorName: 'Amit Sen',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    subject: 'Mathematics',
    availableDays: ['Sun', 'Tue', 'Thu'],
    availableTimeSlot: '4:30 PM - 7:30 PM',
    hourlyFee: 850,
    totalSlot: 4,
    sessionStartDate: new Date('2026-06-03'),
    institution: 'CU (University of Chittagong)',
    experience: '3 Years teaching School & College Level Mathematics.',
    location: 'GEC Circle, Chittagong',
    teachingMode: 'Offline',
    description: 'Building strong foundations in Trigonometry, Geometry, and Math olympiad topics. Personalized attention and customized homework worksheets.',
    rating: 4.7,
    totalReviews: 20
  },
  {
    tutorName: 'Tasnim Alam',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
    subject: 'Physics',
    availableDays: ['Mon', 'Wed', 'Fri'],
    availableTimeSlot: '5:00 PM - 7:00 PM',
    hourlyFee: 900,
    totalSlot: 3,
    sessionStartDate: new Date('2026-06-08'),
    institution: 'SUST (Shahjalal University of Science & Technology)',
    experience: '4 Years teaching Newtonian Physics and Thermodynamics.',
    location: 'Zindabazar, Sylhet',
    teachingMode: 'Both',
    description: 'Interactive conceptual physics classes with numerical problem-solving sessions. Helping students transition from memorize-and-forget to master-and-retain.',
    rating: 4.8,
    totalReviews: 22
  }
];

const seedDatabase = async () => {
  try {
    const db = await connectDB();
    console.log('Seeding process initiated...');

    // 1. Get or create a seeder user
    let seederUser = await db.collection('users').findOne({ email: 'seeder@mediqueue.com' });
    
    if (!seederUser) {
      // Find any user in the system to use if one exists, otherwise create
      const anyUser = await db.collection('users').findOne({});
      if (anyUser) {
        seederUser = anyUser;
        console.log(`Using existing user: ${seederUser.name} (${seederUser.email}) for tutor association`);
      } else {
        const hashedPassword = hashPassword('seeder123');
        const userResult = await db.collection('users').insertOne({
          name: 'Seeder Admin',
          email: 'seeder@mediqueue.com',
          password: hashedPassword,
          photo: 'https://i.ibb.co.com/mFMvVqN/avatar-placeholder.png',
          role: 'student',
          googleId: null,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        seederUser = { _id: userResult.insertedId, name: 'Seeder Admin', email: 'seeder@mediqueue.com' };
        console.log('Created a new default user for seeding tutors:', seederUser.email);
      }
    } else {
      console.log(`Using existing seeder user: ${seederUser.name} (${seederUser.email})`);
    }

    // 2. Clear existing tutors to avoid duplication and keep data clean
    const deleteResult = await db.collection('tutors').deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing tutors from database`);

    // 3. Associate tutors with the user and insert
    const preparedTutors = tutorsData.map(tutor => ({
      ...tutor,
      userId: seederUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const insertResult = await db.collection('tutors').insertMany(preparedTutors);
    console.log(`Successfully seeded ${insertResult.insertedCount} Bangladeshi tutors into database!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
