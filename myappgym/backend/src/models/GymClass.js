const mongoose = require('mongoose');

const gymClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['yoga', 'pilates', 'zumba', 'spin', 'hiit', 'strength', 'cardio', 'boxing', 'crossfit', 'other'],
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  schedule: {
    dayOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    specificDates: [Date]
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentEnrollment: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'all-levels'
  },
  price: {
    memberPrice: {
      type: Number,
      default: 0
    },
    nonMemberPrice: {
      type: Number,
      default: 0
    }
  },
  equipment: [String],
  enrolledMembers: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'waitlisted', 'cancelled'],
      default: 'enrolled'
    }
  }],
  waitlist: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecurring: {
    type: Boolean,
    default: true
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'none'],
    default: 'weekly'
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  cancellationReason: String,
  notes: String,
  image: String,
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

gymClassSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.currentEnrollment;
});

gymClassSchema.virtual('isFull').get(function() {
  return this.currentEnrollment >= this.capacity;
});

gymClassSchema.methods.canEnroll = function() {
  return this.status === 'scheduled' && !this.isFull;
};

gymClassSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GymClass', gymClassSchema);
