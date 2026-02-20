const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years'],
      default: 'months'
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  features: [{
    name: String,
    included: {
      type: Boolean,
      default: true
    },
    limit: Number
  }],
  classAccess: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymClass'
  }],
  maxFreezeDays: {
    type: Number,
    default: 30
  },
  personalTrainerSessions: {
    included: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    }
  },
  guestPasses: {
    included: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    }
  },
  accessHours: {
    start: {
      type: String,
      default: '00:00'
    },
    end: {
      type: String,
      default: '23:59'
    },
    allDay: {
      type: Boolean,
      default: true
    }
  },
  facilities: [{
    type: String,
    enum: ['gym', 'pool', 'sauna', 'locker', 'parking', 'all']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
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

membershipPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
