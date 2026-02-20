const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
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
  dateOfBirth: {
    type: Date
  },
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
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  membership: {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'frozen'],
      default: 'active'
    },
    freezeDates: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },
  healthInfo: {
    injuries: [String],
    medicalConditions: [String],
    medications: [String],
    allergies: [String],
    notes: String
  },
  fitnessGoals: [String],
  profileImage: String,
  qrCode: {
    type: String,
    unique: true
  },
  checkIns: [{
    date: {
      type: Date,
      default: Date.now
    },
    checkIn: Date,
    checkOut: Date
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
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

memberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

memberSchema.methods.isMembershipActive = function() {
  return this.membership.status === 'active' && 
         this.membership.endDate && 
         new Date() <= this.membership.endDate;
};

memberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Member', memberSchema);
