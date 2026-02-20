import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiAlertTriangle,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import api from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, revenueRes, attendanceRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue?period=month'),
        api.get('/dashboard/attendance?period=week')
      ]);
      setStats(statsRes.data.data);
      setRevenueData(revenueRes.data.data);
      setAttendanceData(attendanceRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

  const statCards = [
    {
      label: 'Total Members',
      value: stats?.members?.total || 0,
      icon: FiUsers,
      trend: stats?.members?.growth,
      color: 'primary'
    },
    {
      label: 'Revenue This Month',
      value: `$${(stats?.revenue?.thisMonth || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'success'
    },
    {
      label: 'Check-ins Today',
      value: stats?.attendance?.today || 0,
      icon: FiActivity,
      color: 'warning'
    },
    {
      label: 'Active Classes',
      value: stats?.classes?.active || 0,
      icon: FiCalendar,
      color: 'info'
    }
  ];

  const revenueChartData = {
    labels: revenueData.map(d => d._id),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map(d => d.total),
        fill: true,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const attendanceChartData = {
    labels: attendanceData.map(d => d._id),
    datasets: [
      {
        label: 'Check-ins',
        data: attendanceData.map(d => d.checkIns),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const memberStatusData = {
    labels: ['Active', 'Expired', 'Frozen'],
    datasets: [
      {
        data: [stats?.members?.total || 0, 15, 5],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B']
      }
    ]
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening at your gym today.</p>
      </div>

      <div className="stat-cards">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-card-icon ${card.color}`}>
              <card.icon />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-label">{card.label}</div>
              {card.trend !== undefined && (
                <div className={`stat-card-trend ${card.trend >= 0 ? 'positive' : 'negative'}`}>
                  <FiTrendingUp />
                  <span>{Math.abs(card.trend)}% from last month</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {stats?.alerts && (stats.alerts.expiringMemberships > 0 || stats.alerts.equipmentNeedingMaintenance > 0) && (
        <div className="alerts-section">
          <h3><FiAlertTriangle /> Alerts</h3>
          <div className="alerts-grid">
            {stats.alerts.expiringMemberships > 0 && (
              <div className="alert-card warning">
                <strong>{stats.alerts.expiringMemberships}</strong>
                <span>memberships expiring this week</span>
              </div>
            )}
            {stats.alerts.equipmentNeedingMaintenance > 0 && (
              <div className="alert-card danger">
                <strong>{stats.alerts.equipmentNeedingMaintenance}</strong>
                <span>equipment items need maintenance</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="charts-grid">
        <div className="card chart-card">
          <h3>Revenue Overview</h3>
          <Line 
            data={revenueChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `$${value}`
                  }
                }
              }
            }}
          />
        </div>

        <div className="card chart-card">
          <h3>Daily Attendance</h3>
          <Line 
            data={attendanceChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>

        <div className="card chart-card">
          <h3>Member Status</h3>
          <Doughnut 
            data={memberStatusData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
