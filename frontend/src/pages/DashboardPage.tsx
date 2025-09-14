import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <Button variant="danger" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
      <div>
        <p>Welcome, {currentUser?.email}!</p>
        {/* Add your dashboard content here */}
      </div>
    </Container>
  );
};

export default DashboardPage;