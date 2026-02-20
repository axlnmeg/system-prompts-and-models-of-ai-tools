const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

const checkIn = async (req, res) => {
  try {
    const { memberId, method = 'manual' } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (!member.isMembershipActive()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Membership is not active' 
      });
    }

    const attendance = await Attendance.create({
      member: memberId,
      checkIn: {
        time: new Date(),
        method,
        verifiedBy: req.user._id
      }
    });

    member.checkIns.push({ date: new Date(), checkIn: new Date() });
    await member.save();

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const checkOut = async (req, res) => {
  try {
    const { memberId } = req.body;
    
    const attendance = await Attendance.findOne({
      member: memberId,
      checkOut: { $exists: false }
    }).sort({ 'checkIn.time': -1 });

    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active check-in found' 
      });
    }

    await attendance.checkOutMember('manual');

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 20, memberId, date, startDate, endDate } = req.query;
    
    let query = {};
    if (memberId) query.member = memberId;
    
    if (date) {
      const dateObj = new Date(date);
      query['checkIn.time'] = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lte: new Date(dateObj.setHours(23, 59, 59, 999))
      };
    } else if (startDate || endDate) {
      query['checkIn.time'] = {};
      if (startDate) query['checkIn.time'].$gte = new Date(startDate);
      if (endDate) query['checkIn.time'].$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('member', 'firstName lastName email')
      .populate('checkIn.verifiedBy', 'firstName lastName')
      .sort({ 'checkIn.time': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      'checkIn.time': { $gte: today }
    })
      .populate('member', 'firstName lastName email membership')
      .sort({ 'checkIn.time': -1 });

    const stats = {
      total: attendance.length,
      currentlyIn: attendance.filter(a => !a.checkOut.time).length,
      averageDuration: attendance
        .filter(a => a.duration > 0)
        .reduce((sum, a) => sum + a.duration, 0) / attendance.filter(a => a.duration > 0).length || 0
    };

    res.json({ success: true, data: { attendance, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMemberAttendanceHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const attendance = await Attendance.find({ member: req.params.memberId })
      .sort({ 'checkIn.time': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments({ member: req.params.memberId });

    res.json({
      success: true,
      data: attendance,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const scanQR = async (req, res) => {
  try {
    const { qrCode } = req.body;

    const member = await Member.findOne({ qrCode });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Invalid QR code' });
    }

    const activeCheckIn = await Attendance.findOne({
      member: member._id,
      checkOut: { $exists: false }
    });

    if (activeCheckIn) {
      await activeCheckIn.checkOutMember('qr-code');
      return res.json({
        success: true,
        message: 'Checked out successfully',
        data: { member, type: 'checkout', attendance: activeCheckIn }
      });
    }

    if (!member.isMembershipActive()) {
      return res.status(400).json({
        success: false,
        message: 'Membership is not active'
      });
    }

    const attendance = await Attendance.create({
      member: member._id,
      checkIn: {
        time: new Date(),
        method: 'qr-code',
        verifiedBy: req.user._id
      }
    });

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: { member, type: 'checkin', attendance }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/', protect, getAttendance);
router.get('/today', protect, getTodayAttendance);
router.post('/scan-qr', protect, scanQR);
router.get('/member/:memberId', protect, getMemberAttendanceHistory);

module.exports = router;
