import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetails from './pages/MemberDetails';
import Classes from './pages/Classes';
import Equipment from './pages/Equipment';
import Payments from './pages/Payments';
import Staff from './pages/Staff';
import Attendance from './pages/Attendance';
import Settings from './pages/Settings';
import Layout from './components/common/Layout';
import './styles/index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/members" element={
        <PrivateRoute>
          <Layout>
            <Members />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/members/:id" element={
        <PrivateRoute>
          <Layout>
            <MemberDetails />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/classes" element={
        <PrivateRoute>
          <Layout>
            <Classes />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/equipment" element={
        <PrivateRoute>
          <Layout>
            <Equipment />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/payments" element={
        <PrivateRoute>
          <Layout>
            <Payments />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/staff" element={
        <PrivateRoute>
          <Layout>
            <Staff />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/attendance" element={
        <PrivateRoute>
          <Layout>
            <Attendance />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Layout>
            <Settings />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
