import React, { useState, useEffect } from 'react';
import { FiPlus, FiTool, FiAlertTriangle } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import './Equipment.css';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cardio',
    brand: '',
    location: { zone: '' },
    quantity: { total: 1, available: 1 },
    condition: 'good'
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipment', formData);
      toast.success('Equipment added successfully');
      setShowModal(false);
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to add equipment');
    }
  };

  const getConditionBadge = (condition) => {
    const styles = {
      excellent: 'badge-success',
      good: 'badge-info',
      fair: 'badge-warning',
      poor: 'badge-danger'
    };
    return styles[condition] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading-screen">Loading equipment...</div>;
  }

  return (
    <div className="equipment-page">
      <div className="page-header">
        <div>
          <h1>Equipment</h1>
          <p>Manage gym equipment and maintenance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Equipment
        </button>
      </div>

      <div className="equipment-grid">
        {equipment.length === 0 ? (
          <div className="empty-state">
            <FiTool style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gray-300)' }} />
            <p>No equipment added</p>
          </div>
        ) : (
          equipment.map((item) => (
            <div key={item._id} className="equipment-card">
              <div className="equipment-header">
                <h3>{item.name}</h3>
                <span className={`badge ${getConditionBadge(item.condition)}`}>
                  {item.condition}
                </span>
              </div>
              
              <div className="equipment-details">
                <div className="detail-item">
                  <span className="label">Category</span>
                  <span className="value">{item.category}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Brand</span>
                  <span className="value">{item.brand || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Location</span>
                  <span className="value">{item.location?.zone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Quantity</span>
                  <span className="value">{item.quantity?.available || 0}/{item.quantity?.total || 0}</span>
                </div>
              </div>

              {item.status === 'maintenance' && (
                <div className="maintenance-alert">
                  <FiAlertTriangle /> Under Maintenance
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add Equipment">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Equipment Name *</label>
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
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
                <option value="free-weights">Free Weights</option>
                <option value="machines">Machines</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                className="form-control"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                className="form-control"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                value={formData.quantity.total}
                onChange={(e) => setFormData({
                  ...formData,
                  quantity: { total: parseInt(e.target.value), available: parseInt(e.target.value) }
                })}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location Zone</label>
            <input
              type="text"
              className="form-control"
              value={formData.location.zone}
              onChange={(e) => setFormData({ ...formData, location: { zone: e.target.value } })}
              placeholder="e.g., Cardio Area"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Equipment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Equipment;
