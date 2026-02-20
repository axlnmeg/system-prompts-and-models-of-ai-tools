const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { protect, authorize } = require('../middleware/auth');

const getEquipment = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, condition } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (condition) query.condition = condition;

    const equipment = await Equipment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Equipment.countDocuments(query);

    res.json({
      success: true,
      data: equipment,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getEquipmentItem = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const addMaintenance = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    equipment.maintenanceHistory.push({
      ...req.body,
      date: new Date()
    });
    equipment.nextMaintenanceDate = req.body.nextMaintenanceDate;
    await equipment.save();
    
    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

router.get('/', protect, getEquipment);
router.get('/:id', protect, getEquipmentItem);
router.post('/', protect, authorize('owner', 'admin'), createEquipment);
router.put('/:id', protect, authorize('owner', 'admin'), updateEquipment);
router.delete('/:id', protect, authorize('owner'), deleteEquipment);
router.post('/:id/maintenance', protect, authorize('owner', 'admin', 'manager'), addMaintenance);

module.exports = router;
