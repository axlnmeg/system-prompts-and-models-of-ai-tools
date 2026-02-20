import React, { useState, useEffect } from 'react';
import { FiPlus, FiCalendar, FiClock, FiUsers } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import './Classes.css';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'yoga',
    instructor: '',
    capacity: 20,
    duration: 60,
    location: '',
    difficulty: 'all-levels',
    schedule: {
      dayOfWeek: [],
      startTime: '09:00',
      endTime: '10:00'
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, instructorsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/staff/instructors')
      ]);
      setClasses(classesRes.data.data);
      setInstructors(instructorsRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (gymClass = null) => {
    if (gymClass) {
      setSelectedClass(gymClass);
      setFormData({
        name: gymClass.name,
        description: gymClass.description || '',
        type: gymClass.type,
        instructor: gymClass.instructor._id || gymClass.instructor,
        capacity: gymClass.capacity,
        duration: gymClass.duration,
        location: gymClass.location,
        difficulty: gymClass.difficulty,
        schedule: gymClass.schedule
      });
    } else {
      setSelectedClass(null);
      setFormData({
        name: '',
        description: '',
        type: 'yoga',
        instructor: '',
        capacity: 20,
        duration: 60,
        location: '',
        difficulty: 'all-levels',
        schedule: {
          dayOfWeek: [],
          startTime: '09:00',
          endTime: '10:00'
        }
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass) {
        await api.put(`/classes/${selectedClass._id}`, formData);
        toast.success('Class updated successfully');
      } else {
        await api.post('/classes', formData);
        toast.success('Class created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDayToggle = (day) => {
    const days = formData.schedule.dayOfWeek.includes(day)
      ? formData.schedule.dayOfWeek.filter(d => d !== day)
      : [...formData.schedule.dayOfWeek, day];
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, dayOfWeek: days }
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      yoga: 'badge-info',
      pilates: 'badge-success',
      hiit: 'badge-danger',
      spin: 'badge-warning',
      strength: 'badge-secondary'
    };
    return colors[type] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading-screen">Loading classes...</div>;
  }

  return (
    <div className="classes-page">
      <div className="page-header">
        <div>
          <h1>Classes</h1>
          <p>Manage gym classes and schedules</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> Add Class
        </button>
      </div>

      <div className="classes-grid">
        {classes.length === 0 ? (
          <div className="empty-state">
            <FiCalendar style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gray-300)' }} />
            <p>No classes scheduled</p>
          </div>
        ) : (
          classes.map((gymClass) => (
            <div key={gymClass._id} className="class-card">
              <div className="class-header">
                <h3>{gymClass.name}</h3>
                <span className={`badge ${getTypeColor(gymClass.type)}`}>
                  {gymClass.type}
                </span>
              </div>
              
              <p className="class-description">{gymClass.description}</p>
              
              <div className="class-details">
                <div className="class-detail">
                  <FiClock />
                  <span>{gymClass.schedule.startTime} - {gymClass.schedule.endTime}</span>
                </div>
                <div className="class-detail">
                  <FiCalendar />
                  <span>{gymClass.schedule.dayOfWeek?.join(', ') || 'Flexible'}</span>
                </div>
                <div className="class-detail">
                  <FiUsers />
                  <span>{gymClass.currentEnrollment}/{gymClass.capacity}</span>
                </div>
              </div>

              <div className="class-footer">
                <div className="instructor">
                  {gymClass.instructor?.firstName} {gymClass.instructor?.lastName}
                </div>
                <div className="location">{gymClass.location}</div>
              </div>

              <button 
                className="btn btn-outline btn-sm mt-2"
                onClick={() => handleOpenModal(gymClass)}
              >
                Edit Class
              </button>
            </div>
          ))
        )}
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={selectedClass ? 'Edit Class' : 'Add New Class'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Class Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="yoga">Yoga</option>
                <option value="pilates">Pilates</option>
                <option value="hiit">HIIT</option>
                <option value="spin">Spin</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Instructor *</label>
              <select
                className="form-control"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                required
              >
                <option value="">Select Instructor</option>
                {instructors.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.firstName} {inst.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input
                type="number"
                className="form-control"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="15"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Studio A"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Schedule</label>
            <div className="days-selector">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${formData.schedule.dayOfWeek.includes(day) ? 'active' : ''}`}
                  onClick={() => handleDayToggle(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.schedule.startTime}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule, startTime: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.schedule.endTime}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule, endTime: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
