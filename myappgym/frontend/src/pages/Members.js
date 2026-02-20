import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiFilter } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import './Members.css';

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    fetchMembers();
  }, [page, status]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await api.get(`/members?${params}`);
      setMembers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        gender: member.gender || '',
        dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : ''
      });
    } else {
      setSelectedMember(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        dateOfBirth: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMember) {
        await api.put(`/members/${selectedMember._id}`, formData);
        toast.success('Member updated successfully');
      } else {
        await api.post('/members', formData);
        toast.success('Member created successfully');
      }
      handleCloseModal();
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      await api.delete(`/members/${id}`);
      toast.success('Member deleted successfully');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  const getStatusBadge = (member) => {
    if (member.membership?.status === 'active' && member.status === 'active') {
      return <span className="badge badge-success">Active</span>;
    } else if (member.membership?.status === 'frozen') {
      return <span className="badge badge-warning">Frozen</span>;
    } else if (member.membership?.status === 'expired') {
      return <span className="badge badge-danger">Expired</span>;
    }
    return <span className="badge badge-secondary">Pending</span>;
  };

  return (
    <div className="members-page">
      <div className="page-header">
        <div>
          <h1>Members</h1>
          <p>Manage your gym members</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> Add Member
        </button>
      </div>

      <div className="card">
        <div className="filters-row">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input">
              <FiSearch />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <select
            className="form-control"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ width: 'auto' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <FiUsers style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gray-300)' }} />
            <p>No members found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Contact</th>
                  <th>Membership</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="member-info">
                        <div className="avatar avatar-sm">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <div className="member-name">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="member-id">#{member.qrCode}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div>{member.email}</div>
                        <div className="text-muted">{member.phone}</div>
                      </div>
                    </td>
                    <td>{member.membership?.plan?.name || 'No Plan'}</td>
                    <td>{getStatusBadge(member)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/members/${member._id}`)}
                          title="View"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleOpenModal(member)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(member._id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i + 1}
                className={page === i + 1 ? 'active' : ''}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Modal
        show={showModal}
        onClose={handleCloseModal}
        title={selectedMember ? 'Edit Member' : 'Add New Member'}
      >
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedMember ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
