const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');
const { protect, authorize } = require('../middleware/auth');

const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, membershipStatus } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (membershipStatus) {
      query['membership.status'] = membershipStatus;
    }

    const members = await Member.find(query)
      .populate('membership.plan', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Member.countDocuments(query);

    res.json({
      success: true,
      data: members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('membership.plan')
      .populate('createdBy', 'firstName lastName');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const createMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const memberData = {
      ...req.body,
      createdBy: req.user._id,
      qrCode: `GYM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    const member = await Member.create(memberData);

    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const updateMembership = async (req, res) => {
  try {
    const { planId, startDate, endDate } = req.body;
    
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    member.membership = {
      plan: planId,
      startDate: startDate || new Date(),
      endDate,
      status: 'active'
    };

    member.status = 'active';
    await member.save();

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const freezeMembership = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    member.membership.freezeDates.push({ startDate, endDate, reason });
    member.membership.status = 'frozen';
    await member.save();

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

router.get('/', protect, getMembers);
router.get('/:id', protect, getMember);
router.post('/', protect, authorize('owner', 'admin'), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required')
], createMember);
router.put('/:id', protect, updateMember);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteMember);
router.put('/:id/membership', protect, authorize('owner', 'admin'), updateMembership);
router.post('/:id/freeze', protect, authorize('owner', 'admin'), freezeMembership);

module.exports = router;
