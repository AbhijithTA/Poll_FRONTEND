import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Polls from './pages/Polls';
import CreatePoll from './pages/CreatePoll';
import EditPoll from './pages/EditPoll';
import PollDetails from './pages/PollDetails';
import AdminPolls from './pages/AdminPolls';
import MyVotes from './pages/MyVotes';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="polls" element={
              <ProtectedRoute>
                <Polls />
              </ProtectedRoute>
            } />
            <Route path="polls/create" element={
              <ProtectedRoute adminOnly={true}>
                <CreatePoll />
              </ProtectedRoute>
            } />
            <Route path="polls/:id/edit" element={
              <ProtectedRoute adminOnly={true}>
                <EditPoll />
              </ProtectedRoute>
            } />
            <Route path="polls/:id" element={
              <ProtectedRoute>
                <PollDetails />
              </ProtectedRoute>
            } />
            <Route path="admin/polls" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPolls />
              </ProtectedRoute>
            } />
            <Route path="my-votes" element={
              <ProtectedRoute>
                <MyVotes />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;