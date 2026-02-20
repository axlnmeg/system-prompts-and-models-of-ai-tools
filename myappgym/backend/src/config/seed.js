require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Member = require('../models/Member');
const MembershipPlan = require('../models/MembershipPlan');
const Staff = require('../models/Staff');
const Equipment = require('../models/Equipment');
const GymClass = require('../models/GymClass');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myappgym');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Member.deleteMany({});
    await MembershipPlan.deleteMany({});
    await Staff.deleteMany({});
    await Equipment.deleteMany({});
    await GymClass.deleteMany({});

    const owner = await User.create({
      email: 'owner@gym.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Owner',
      phone: '+1234567890',
      role: 'owner'
    });
    console.log('Owner created:', owner.email);

    const admin = await User.create({
      email: 'admin@gym.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Admin',
      phone: '+1234567891',
      role: 'admin'
    });
    console.log('Admin created:', admin.email);

    const plans = await MembershipPlan.insertMany([
      {
        name: 'Basic',
        description: 'Access to gym floor and basic equipment',
        duration: { value: 1, unit: 'months' },
        price: 29.99,
        features: [
          { name: 'Gym Access', included: true },
          { name: 'Locker Room', included: true },
          { name: 'Group Classes', included: false },
          { name: 'Personal Training', included: false }
        ],
        facilities: ['gym', 'locker'],
        isPopular: false,
        displayOrder: 1
      },
      {
        name: 'Standard',
        description: 'Full gym access with group classes',
        duration: { value: 1, unit: 'months' },
        price: 49.99,
        features: [
          { name: 'Gym Access', included: true },
          { name: 'Locker Room', included: true },
          { name: 'Group Classes', included: true },
          { name: 'Personal Training', included: false, limit: 0 }
        ],
        facilities: ['gym', 'locker', 'pool', 'sauna'],
        isPopular: true,
        displayOrder: 2
      },
      {
        name: 'Premium',
        description: 'All-inclusive membership with personal training',
        duration: { value: 1, unit: 'months' },
        price: 99.99,
        features: [
          { name: 'Gym Access', included: true },
          { name: 'Locker Room', included: true },
          { name: 'Group Classes', included: true },
          { name: 'Personal Training', included: true, limit: 4 }
        ],
        facilities: ['gym', 'locker', 'pool', 'sauna', 'parking'],
        personalTrainerSessions: { included: 4, available: 4 },
        guestPasses: { included: 2, available: 2 },
        isPopular: false,
        displayOrder: 3
      },
      {
        name: 'Annual Basic',
        description: 'Annual basic membership - save 2 months',
        duration: { value: 12, unit: 'months' },
        price: 299.99,
        features: [
          { name: 'Gym Access', included: true },
          { name: 'Locker Room', included: true },
          { name: 'Group Classes', included: false },
          { name: 'Personal Training', included: false }
        ],
        facilities: ['gym', 'locker'],
        isPopular: false,
        displayOrder: 4
      }
    ]);
    console.log('Membership plans created:', plans.length);

    const staff = await Staff.insertMany([
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@gym.com',
        phone: '+1234567892',
        role: 'trainer',
        specialization: ['Strength Training', 'Bodybuilding'],
        employment: {
          type: 'full-time',
          salary: { amount: 4500, currency: 'USD', frequency: 'monthly' }
        },
        personalTraining: { available: true, hourlyRate: 75, maxClients: 20 },
        status: 'active'
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah@gym.com',
        phone: '+1234567893',
        role: 'instructor',
        specialization: ['Yoga', 'Pilates', 'Meditation'],
        employment: {
          type: 'part-time',
          salary: { amount: 25, currency: 'USD', frequency: 'hourly' }
        },
        personalTraining: { available: true, hourlyRate: 60, maxClients: 15 },
        status: 'active'
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david@gym.com',
        phone: '+1234567894',
        role: 'instructor',
        specialization: ['HIIT', 'CrossFit', 'Cardio'],
        employment: {
          type: 'full-time',
          salary: { amount: 4000, currency: 'USD', frequency: 'monthly' }
        },
        personalTraining: { available: true, hourlyRate: 70, maxClients: 18 },
        status: 'active'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily@gym.com',
        phone: '+1234567895',
        role: 'receptionist',
        employment: {
          type: 'full-time',
          salary: { amount: 2800, currency: 'USD', frequency: 'monthly' }
        },
        status: 'active'
      }
    ]);
    console.log('Staff members created:', staff.length);

    const equipment = await Equipment.insertMany([
      {
        name: 'Treadmill Pro 3000',
        category: 'cardio',
        brand: 'FitTech',
        model: 'T3000',
        location: { zone: 'Cardio Area', floor: '1st Floor' },
        quantity: { total: 10, available: 10 },
        condition: 'excellent',
        status: 'available',
        purchaseInfo: {
          date: new Date('2023-01-15'),
          price: 2500,
          warrantyExpiry: new Date('2026-01-15')
        }
      },
      {
        name: 'Olympic Barbell',
        category: 'free-weights',
        brand: 'IronMaster',
        model: 'OB-45',
        location: { zone: 'Free Weights', floor: '1st Floor' },
        quantity: { total: 20, available: 20 },
        condition: 'good',
        status: 'available',
        purchaseInfo: {
          date: new Date('2022-06-01'),
          price: 300
        }
      },
      {
        name: 'Leg Press Machine',
        category: 'machines',
        brand: 'PowerGym',
        model: 'LP-500',
        location: { zone: 'Strength Area', floor: '1st Floor' },
        quantity: { total: 3, available: 3 },
        condition: 'good',
        status: 'available',
        purchaseInfo: {
          date: new Date('2022-03-20'),
          price: 3500
        }
      },
      {
        name: 'Exercise Bike',
        category: 'cardio',
        brand: 'SpinMaster',
        model: 'SM-200',
        location: { zone: 'Cardio Area', floor: '1st Floor' },
        quantity: { total: 15, available: 15 },
        condition: 'good',
        status: 'available',
        purchaseInfo: {
          date: new Date('2023-03-10'),
          price: 1200
        }
      },
      {
        name: 'Dumbbell Set (5-50 lbs)',
        category: 'free-weights',
        brand: 'IronMaster',
        location: { zone: 'Free Weights', floor: '1st Floor' },
        quantity: { total: 1, available: 1 },
        condition: 'excellent',
        status: 'available',
        purchaseInfo: {
          date: new Date('2023-02-01'),
          price: 1500
        }
      }
    ]);
    console.log('Equipment created:', equipment.length);

    const members = [];
    const memberData = [
      { firstName: 'Alice', lastName: 'Smith', email: 'alice@email.com', phone: '+1234567901' },
      { firstName: 'Bob', lastName: 'Johnson', email: 'bob@email.com', phone: '+1234567902' },
      { firstName: 'Carol', lastName: 'Williams', email: 'carol@email.com', phone: '+1234567903' },
      { firstName: 'Dan', lastName: 'Brown', email: 'dan@email.com', phone: '+1234567904' },
      { firstName: 'Eva', lastName: 'Martinez', email: 'eva@email.com', phone: '+1234567905' }
    ];

    for (let i = 0; i < memberData.length; i++) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      members.push(await Member.create({
        ...memberData[i],
        dateOfBirth: new Date(1990 + i, i, 15),
        gender: i % 2 === 0 ? 'female' : 'male',
        membership: {
          plan: plans[i % plans.length]._id,
          startDate: new Date(),
          endDate: endDate,
          status: 'active'
        },
        status: 'active',
        qrCode: `GYM-SEED-${i.toString().padStart(5, '0')}`,
        createdBy: owner._id
      }));
    }
    console.log('Members created:', members.length);

    const classes = await GymClass.insertMany([
      {
        name: 'Morning Yoga',
        description: 'Start your day with energizing yoga flow',
        type: 'yoga',
        instructor: staff[1]._id,
        schedule: {
          dayOfWeek: ['monday', 'wednesday', 'friday'],
          startTime: '07:00',
          endTime: '08:00'
        },
        duration: 60,
        capacity: 20,
        currentEnrollment: 12,
        location: 'Studio A',
        difficulty: 'beginner',
        price: { memberPrice: 0, nonMemberPrice: 15 },
        status: 'scheduled',
        createdBy: owner._id
      },
      {
        name: 'HIIT Training',
        description: 'High-intensity interval training for maximum burn',
        type: 'hiit',
        instructor: staff[2]._id,
        schedule: {
          dayOfWeek: ['tuesday', 'thursday'],
          startTime: '18:00',
          endTime: '19:00'
        },
        duration: 60,
        capacity: 15,
        currentEnrollment: 10,
        location: 'Studio B',
        difficulty: 'intermediate',
        price: { memberPrice: 0, nonMemberPrice: 20 },
        status: 'scheduled',
        createdBy: owner._id
      },
      {
        name: 'Spin Class',
        description: 'Indoor cycling for cardio fitness',
        type: 'spin',
        instructor: staff[2]._id,
        schedule: {
          dayOfWeek: ['monday', 'wednesday', 'friday'],
          startTime: '17:30',
          endTime: '18:30'
        },
        duration: 60,
        capacity: 25,
        currentEnrollment: 18,
        location: 'Spin Room',
        difficulty: 'all-levels',
        price: { memberPrice: 0, nonMemberPrice: 18 },
        status: 'scheduled',
        createdBy: owner._id
      },
      {
        name: 'Strength Training 101',
        description: 'Learn proper form and technique for strength exercises',
        type: 'strength',
        instructor: staff[0]._id,
        schedule: {
          dayOfWeek: ['tuesday', 'thursday'],
          startTime: '10:00',
          endTime: '11:00'
        },
        duration: 60,
        capacity: 12,
        currentEnrollment: 8,
        location: 'Weight Room',
        difficulty: 'beginner',
        price: { memberPrice: 10, nonMemberPrice: 25 },
        status: 'scheduled',
        createdBy: owner._id
      }
    ]);
    console.log('Classes created:', classes.length);

    console.log('\n=== Seed Complete ===');
    console.log('Owner login: owner@gym.com / password123');
    console.log('Admin login: admin@gym.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
