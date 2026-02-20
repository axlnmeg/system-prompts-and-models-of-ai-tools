const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  type: {
    type: String,
    enum: ['membership', 'class', 'personal-training', 'merchandise', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partial-refund'],
    default: 'pending'
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['cash', 'credit-card', 'debit-card', 'bank-transfer', 'check', 'other']
    },
    lastFour: String,
    cardType: String,
    transactionId: String
  },
  membership: {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan'
    },
    duration: {
      value: Number,
      unit: String
    },
    startDate: Date,
    endDate: Date
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymClass'
  },
  discount: {
    code: String,
    percentage: Number,
    amount: Number,
    reason: String
  },
  tax: {
    rate: Number,
    amount: Number
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  invoiceNumber: {
    type: String,
    unique: true
  },
  dueDate: Date,
  paidAt: Date,
  recurring: {
    isActive: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    nextPaymentDate: Date
  },
  notes: String,
  processedBy: {
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

paymentSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

paymentSchema.virtual('totalAmount').get(function() {
  let total = this.amount;
  if (this.discount && this.discount.amount) {
    total -= this.discount.amount;
  }
  if (this.tax && this.tax.amount) {
    total += this.tax.amount;
  }
  return total;
});

module.exports = mongoose.model('Payment', paymentSchema);
