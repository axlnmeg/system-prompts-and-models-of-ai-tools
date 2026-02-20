import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiCreditCard, FiSnowflake, FiUser } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './MemberDetails.css';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${id}`);
      setMember(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch member');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading member details...</div>;
  }

  if (!member) {
    return <div className="loading-screen">Member not found</div>;
  }

  const getStatusBadge = () => {
    if (member.membership?.status === 'active') {
      return <span className="badge badge-success">Active</span>;
    } else if (member.membership?.status === 'frozen') {
      return <span className="badge badge-warning">Frozen</span>;
    } else if (member.membership?.status === 'expired') {
      return <span className="badge badge-danger">Expired</span>;
    }
    return <span className="badge badge-secondary">Pending</span>;
  };

  return (
    <div className="member-details">
      <button className="btn btn-secondary mb-4" onClick={() => navigate('/members')}>
        <FiArrowLeft /> Back to Members
      </button>

      <div className="details-grid">
        <div className="card profile-card">
          <div className="profile-header">
            <div className="avatar avatar-lg">
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <div className="profile-info">
              <h2>{member.firstName} {member.lastName}</h2>
              <p>{member.email}</p>
              {getStatusBadge()}
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="label">Phone</span>
              <span className="value">{member.phone}</span>
            </div>
            <div className="detail-row">
              <span className="label">Gender</span>
              <span className="value">{member.gender || 'Not specified'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Date of Birth</span>
              <span className="value">
                {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Member ID</span>
              <span className="value">{member.qrCode}</span>
            </div>
          </div>
        </div>

        <div className="card membership-card">
          <div className="card-header">
            <h3>Membership</h3>
            {member.membership?.plan && getStatusBadge()}
          </div>

          {member.membership?.plan ? (
            <div className="membership-details">
              <div className="detail-row">
                <span className="label">Plan</span>
                <span className="value">{member.membership.plan.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Price</span>
                <span className="value">${member.membership.plan.price}/month</span>
              </div>
              <div className="detail-row">
                <span className="label">Start Date</span>
                <span className="value">
                  {new Date(member.membership.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">End Date</span>
                <span className="value">
                  {new Date(member.membership.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted">No active membership</p>
          )}
        </div>

        <div className="card checkins-card">
          <h3>Recent Check-ins</h3>
          {member.checkIns && member.checkIns.length > 0 ? (
            <div className="checkins-list">
              {member.checkIns.slice(0, 5).map((checkIn, index) => (
                <div key={index} className="checkin-item">
                  <div className="checkin-date">
                    {new Date(checkIn.date).toLocaleDateString()}
                  </div>
                  <div className="checkin-time">
                    {checkIn.checkIn ? new Date(checkIn.checkIn).toLocaleTimeString() : '--:--'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No recent check-ins</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
