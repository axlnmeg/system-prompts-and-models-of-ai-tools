const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const GymClass = require('../models/GymClass');
const Attendance = require('../models/Attendance');
const Equipment = require('../models/Equipment');
const Staff = require('../models/Staff');
const { protect, authorize } = require('../middleware/auth');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const totalMembers = await Member.countDocuments({ status: 'active' });
    const newMembersThisMonth = await Member.countDocuments({
      status: 'active',
      createdAt: { $gte: startOfMonth }
    });
    const newMembersLastMonth = await Member.countDocuments({
      status: 'active',
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const revenueThisMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueLastMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todaysCheckIns = await Attendance.countDocuments({
      'checkIn.time': { $gte: todayStart }
    });

    const activeClasses = await GymClass.countDocuments({ status: 'scheduled' });
    
    const expiringMemberships = await Member.countDocuments({
      'membership.status': 'active',
      'membership.endDate': {
        $gte: today,
        $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    const equipmentNeedingMaintenance = await Equipment.countDocuments({
      nextMaintenanceDate: { $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) }
    });

    const activeStaff = await Staff.countDocuments({ status: 'active' });

    res.json({
      success: true,
      data: {
        members: {
          total: totalMembers,
          newThisMonth: newMembersThisMonth,
          newLastMonth: newMembersLastMonth,
          growth: newMembersLastMonth > 0 
            ? ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth * 100).toFixed(1)
            : 0
        },
        revenue: {
          thisMonth: revenueThisMonth[0]?.total || 0,
          lastMonth: revenueLastMonth[0]?.total || 0
        },
        attendance: {
          today: todaysCheckIns
        },
        classes: {
          active: activeClasses
        },
        alerts: {
          expiringMemberships,
          equipmentNeedingMaintenance
        },
        staff: {
          active: activeStaff
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getRevenueChart = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const today = new Date();
    let startDate, groupFormat;

    switch (period) {
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        groupFormat = '%Y-%m';
        break;
      case 'year':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        groupFormat = '%Y-%m';
    }

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAttendanceChart = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const today = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const attendance = await Attendance.aggregate([
      {
        $match: {
          'checkIn.time': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn.time' } },
          checkIns: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMemberGrowthChart = async (req, res) => {
  try {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    const growth = await Member.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          newMembers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: growth });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getClassPopularity = async (req, res) => {
  try {
    const popular = await GymClass.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgEnrollment: { $avg: '$currentEnrollment' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ success: true, data: popular });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

router.get('/stats', protect, getDashboardStats);
router.get('/revenue', protect, authorize('owner', 'admin'), getRevenueChart);
router.get('/attendance', protect, getAttendanceChart);
router.get('/member-growth', protect, authorize('owner', 'admin'), getMemberGrowthChart);
router.get('/class-popularity', protect, getClassPopularity);

module.exports = router;
