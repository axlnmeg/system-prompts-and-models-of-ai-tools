const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const GymClass = require('../models/GymClass');
const { protect, authorize } = require('../middleware/auth');

const getClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, day, instructor } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (instructor) query.instructor = instructor;
    if (day) query['schedule.dayOfWeek'] = day.toLowerCase();

    const classes = await GymClass.find(query)
      .populate('instructor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GymClass.countDocuments(query);

    res.json({
      success: true,
      data: classes,
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

const getClass = async (req, res) => {
  try {
    const gymClass = await GymClass.findById(req.params.id)
      .populate('instructor', 'firstName lastName specialization')
      .populate('enrolledMembers.member', 'firstName lastName email phone');

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: gymClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const gymClass = await GymClass.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: gymClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const gymClass = await GymClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: gymClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const gymClass = await GymClass.findByIdAndDelete(req.params.id);

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const enrollMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const gymClass = await GymClass.findById(req.params.id);

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (gymClass.isFull) {
      gymClass.waitlist.push({ member: memberId });
      await gymClass.save();
      return res.json({
        success: true,
        message: 'Added to waitlist',
        data: gymClass
      });
    }

    gymClass.enrolledMembers.push({ member: memberId, status: 'enrolled' });
    gymClass.currentEnrollment += 1;
    await gymClass.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in class',
      data: gymClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const cancelEnrollment = async (req, res) => {
  try {
    const { memberId } = req.body;
    const gymClass = await GymClass.findById(req.params.id);

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const enrollmentIndex = gymClass.enrolledMembers.findIndex(
      e => e.member.toString() === memberId
    );

    if (enrollmentIndex > -1) {
      gymClass.enrolledMembers[enrollmentIndex].status = 'cancelled';
      gymClass.currentEnrollment -= 1;
      
      if (gymClass.waitlist.length > 0) {
        const nextInLine = gymClass.waitlist.shift();
        gymClass.enrolledMembers.push({
          member: nextInLine.member,
          status: 'enrolled'
        });
        gymClass.currentEnrollment += 1;
      }
      
      await gymClass.save();
    }

    res.json({
      success: true,
      message: 'Enrollment cancelled',
      data: gymClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getClassSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { status: 'scheduled' };
    
    if (startDate || endDate) {
      query.$or = [];
      if (startDate && endDate) {
        query.$or.push({
          'schedule.specificDates': {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        });
      }
    }

    const classes = await GymClass.find(query)
      .populate('instructor', 'firstName lastName')
      .sort({ 'schedule.startTime': 1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

router.get('/', protect, getClasses);
router.get('/schedule', protect, getClassSchedule);
router.get('/:id', protect, getClass);
router.post('/', protect, authorize('owner', 'admin'), [
  body('name').notEmpty().withMessage('Class name is required'),
  body('type').notEmpty().withMessage('Class type is required'),
  body('instructor').notEmpty().withMessage('Instructor is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('duration').isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes')
], createClass);
router.put('/:id', protect, authorize('owner', 'admin'), updateClass);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteClass);
router.post('/:id/enroll', protect, enrollMember);
router.post('/:id/cancel', protect, cancelEnrollment);

module.exports = router;
