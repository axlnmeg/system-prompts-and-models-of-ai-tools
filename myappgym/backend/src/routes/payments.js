const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const { protect, authorize } = require('../middleware/auth');

const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, memberId, startDate, endDate } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (memberId) query.member = memberId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('member', 'firstName lastName email')
      .populate('membership.plan', 'name')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('member', 'firstName lastName email phone')
      .populate('membership.plan')
      .populate('class');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      processedBy: req.user._id
    });
    
    if (req.body.type === 'membership' && req.body.membership) {
      await Member.findByIdAndUpdate(req.body.member, {
        membership: {
          plan: req.body.membership.plan,
          startDate: req.body.membership.startDate,
          endDate: req.body.membership.endDate,
          status: 'active'
        },
        status: 'active'
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const refundPayment = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = amount >= payment.amount ? 'refunded' : 'partial-refund';
    payment.refund = {
      amount,
      reason,
      processedAt: new Date(),
      processedBy: req.user._id
    };
    await payment.save();

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = { status: 'completed' };
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const stats = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalRevenue = stats.reduce((sum, item) => sum + item.total, 0);
    const totalPayments = stats.reduce((sum, item) => sum + item.count, 0);

    res.json({
      success: true,
      data: {
        daily: stats,
        totalRevenue,
        totalPayments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

router.get('/', protect, getPayments);
router.get('/stats', protect, authorize('owner', 'admin'), getRevenueStats);
router.get('/:id', protect, getPayment);
router.post('/', protect, createPayment);
router.put('/:id', protect, updatePayment);
router.post('/:id/refund', protect, authorize('owner', 'admin'), refundPayment);

module.exports = router;
