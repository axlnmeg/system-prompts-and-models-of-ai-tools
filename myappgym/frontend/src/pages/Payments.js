import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiDownload, FiFilter } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '' });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);

      const [paymentsRes, statsRes] = await Promise.all([
        api.get(`/payments?${params}`),
        api.get('/payments/stats')
      ]);
      
      setPayments(paymentsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-danger',
      refunded: 'badge-info'
    };
    return styles[status] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading-screen">Loading payments...</div>;
  }

  return (
    <div className="payments-page">
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Track revenue and payment history</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-icon success"><FiDollarSign /></div>
          <div className="stat-card-value">${stats?.totalRevenue?.toLocaleString() || 0}</div>
          <div className="stat-card-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon primary"><FiDollarSign /></div>
          <div className="stat-card-value">{stats?.totalPayments || 0}</div>
          <div className="stat-card-label">Total Transactions</div>
        </div>
      </div>

      <div className="card">
        <div className="filters-row">
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="membership">Membership</option>
            <option value="class">Class</option>
            <option value="personal-training">Personal Training</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Member</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.invoiceNumber}</td>
                  <td>
                    {payment.member?.firstName} {payment.member?.lastName}
                  </td>
                  <td className="capitalize">{payment.type}</td>
                  <td>${payment.amount}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
