import React, { useState, useEffect } from 'react';
import { FiUserCheck, FiClock, FiUsers } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Attendance.css';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInData, setCheckInData] = useState({ memberId: '' });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      setAttendance(response.data.data.attendance);
      setTodayStats(response.data.data.stats);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/check-in', {
        memberId: checkInData.memberId
      });
      toast.success('Check-in successful');
      setCheckInData({ memberId: '' });
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (memberId) => {
    try {
      await api.post('/attendance/check-out', { memberId });
      toast.success('Check-out successful');
      fetchAttendance();
    } catch (error) {
      toast.error('Check-out failed');
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading attendance...</div>;
  }

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Track member check-ins and check-outs</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-icon primary"><FiUsers /></div>
          <div className="stat-card-value">{todayStats?.total || 0}</div>
          <div className="stat-card-label">Total Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon success"><FiUserCheck /></div>
          <div className="stat-card-value">{todayStats?.currentlyIn || 0}</div>
          <div className="stat-card-label">Currently In</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon warning"><FiClock /></div>
          <div className="stat-card-value">
            {todayStats?.averageDuration ? Math.round(todayStats.averageDuration) : 0} min
          </div>
          <div className="stat-card-label">Avg Duration</div>
        </div>
      </div>

      <div className="card">
        <h3>Manual Check-in</h3>
        <form onSubmit={handleCheckIn} className="checkin-form">
          <input
            type="text"
            className="form-control"
            placeholder="Enter Member ID or QR Code"
            value={checkInData.memberId}
            onChange={(e) => setCheckInData({ memberId: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary">Check In</button>
        </form>
      </div>

      <div className="card">
        <h3>Today's Activity</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No check-ins today</td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id}>
                    <td>
                      {record.member?.firstName} {record.member?.lastName}
                    </td>
                    <td>
                      {new Date(record.checkIn.time).toLocaleTimeString()}
                    </td>
                    <td>
                      {record.checkOut?.time 
                        ? new Date(record.checkOut.time).toLocaleTimeString()
                        : '--:--'}
                    </td>
                    <td>{record.duration ? `${record.duration} min` : 'Active'}</td>
                    <td>
                      {!record.checkOut?.time && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCheckOut(record.member._id)}
                        >
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
