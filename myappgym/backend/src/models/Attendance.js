const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  checkIn: {
    time: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['qr-code', 'fingerprint', 'manual', 'card', 'app'],
      default: 'manual'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  checkOut: {
    time: Date,
    method: {
      type: String,
      enum: ['automatic', 'manual', 'app']
    }
  },
  duration: {
    type: Number,
    default: 0
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymClass'
  },
  personalTraining: {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    sessionType: String
  },
  activities: [{
    type: {
      type: String,
      enum: ['cardio', 'strength', 'class', 'personal-training', 'stretching', 'other']
    },
    duration: Number,
    equipment: [String],
    notes: String
  }],
  location: {
    zone: String,
    floor: String
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

attendanceSchema.methods.checkOutMember = function(method = 'automatic') {
  this.checkOut = {
    time: new Date(),
    method: method
  };
  this.duration = Math.round((this.checkOut.time - this.checkIn.time) / (1000 * 60));
  return this.save();
};

attendanceSchema.statics.getTodayStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await this.aggregate([
    {
      $match: {
        'checkIn.time': { $gte: today }
      }
    },
    {
      $group: {
        _id: null,
        totalCheckIns: { $sum: 1 },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);
};

module.exports = mongoose.model('Attendance', attendanceSchema);
