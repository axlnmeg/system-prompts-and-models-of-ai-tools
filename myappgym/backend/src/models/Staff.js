const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  role: {
    type: String,
    enum: ['trainer', 'instructor', 'receptionist', 'manager', 'maintenance', 'cleaner', 'other'],
    required: true
  },
  specialization: [String],
  certifications: [{
    name: String,
    issuingOrganization: String,
    dateObtained: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  employment: {
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance'],
      default: 'full-time'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    salary: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      frequency: {
        type: String,
        enum: ['hourly', 'weekly', 'biweekly', 'monthly', 'yearly'],
        default: 'monthly'
      }
    },
    workHours: {
      daysPerWeek: Number,
      hoursPerDay: Number
    }
  },
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String,
    location: String
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  profileImage: String,
  bio: String,
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymClass'
  }],
  personalTraining: {
    available: {
      type: Boolean,
      default: false
    },
    hourlyRate: Number,
    maxClients: Number,
    currentClients: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'terminated'],
    default: 'active'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

staffSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

staffSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Staff', staffSchema);
