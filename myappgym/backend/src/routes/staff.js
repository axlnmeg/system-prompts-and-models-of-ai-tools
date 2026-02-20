const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { protect, authorize } = require('../middleware/auth');

const getStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, specialization } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (specialization) query.specialization = { $in: [specialization] };

    const staff = await Staff.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      data: staff,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getStaffMember = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const staff = await Staff.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getInstructors = async (req, res) => {
  try {
    const instructors = await Staff.find({
      role: { $in: ['trainer', 'instructor'] },
      status: 'active'
    }).select('firstName lastName specialization rating');

    res.json({ success: true, data: instructors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

router.get('/', protect, getStaff);
router.get('/instructors', protect, getInstructors);
router.get('/:id', protect, getStaffMember);
router.post('/', protect, authorize('owner', 'admin'), createStaff);
router.put('/:id', protect, authorize('owner', 'admin'), updateStaff);
router.delete('/:id', protect, authorize('owner'), deleteStaff);

module.exports = router;
