import React, { useState, useEffect } from 'react';
import { FiPlus, FiUserCheck, FiMail, FiPhone } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import './Staff.css';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'trainer',
    specialization: [],
    status: 'active'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', formData);
      toast.success('Staff member added successfully');
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      toast.error('Failed to add staff member');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      trainer: 'badge-primary',
      instructor: 'badge-info',
      manager: 'badge-success',
      receptionist: 'badge-warning'
    };
    return styles[role] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading-screen">Loading staff...</div>;
  }

  return (
    <div className="staff-page">
      <div className="page-header">
        <div>
          <h1>Staff</h1>
          <p>Manage gym staff and trainers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Staff
        </button>
      </div>

      <div className="staff-grid">
        {staff.length === 0 ? (
          <div className="empty-state">
            <FiUserCheck style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gray-300)' }} />
            <p>No staff members added</p>
          </div>
        ) : (
          staff.map((member) => (
            <div key={member._id} className="staff-card">
              <div className="staff-avatar">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <h3>{member.firstName} {member.lastName}</h3>
              <span className={`badge ${getRoleBadge(member.role)}`}>
                {member.role}
              </span>
              
              <div className="staff-contact">
                <div className="contact-item">
                  <FiMail /> {member.email}
                </div>
                <div className="contact-item">
                  <FiPhone /> {member.phone}
                </div>
              </div>

              {member.specialization && member.specialization.length > 0 && (
                <div className="specializations">
                  {member.specialization.map((spec, i) => (
                    <span key={i} className="spec-tag">{spec}</span>
                  ))}
                </div>
              )}

              <div className={`status-indicator ${member.status}`}>
                {member.status}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add Staff Member">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              className="form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="trainer">Trainer</option>
              <option value="instructor">Instructor</option>
              <option value="manager">Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Staff</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
