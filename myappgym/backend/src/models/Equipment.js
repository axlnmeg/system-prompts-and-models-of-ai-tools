const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'free-weights', 'machines', 'accessories', 'other'],
    required: true
  },
  subCategory: String,
  brand: String,
  model: String,
  serialNumber: String,
  description: String,
  location: {
    zone: String,
    floor: String,
    room: String
  },
  purchaseInfo: {
    date: Date,
    vendor: String,
    price: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    invoiceNumber: String,
    warrantyExpiry: Date
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'needs-repair', 'out-of-order'],
    default: 'good'
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'repair', 'retired'],
    default: 'available'
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['routine', 'repair', 'inspection', 'cleaning', 'other']
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    cost: Number,
    notes: String,
    nextMaintenanceDate: Date
  }],
  nextMaintenanceDate: Date,
  usageStats: {
    totalUsageHours: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    averageDailyUsage: Number
  },
  quantity: {
    total: {
      type: Number,
      default: 1
    },
    available: {
      type: Number,
      default: 1
    }
  },
  imageUrl: String,
  manualUrl: String,
  maxWeightCapacity: Number,
  requiresTraining: {
    type: Boolean,
    default: false
  },
  ageRestriction: Number,
  bookingRequired: {
    type: Boolean,
    default: false
  },
  notes: String,
  tags: [String],
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

equipmentSchema.methods.scheduleMaintenance = function(maintenanceData) {
  this.maintenanceHistory.push(maintenanceData);
  this.nextMaintenanceDate = maintenanceData.nextMaintenanceDate;
  this.status = 'maintenance';
  return this.save();
};

equipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Equipment', equipmentSchema);
