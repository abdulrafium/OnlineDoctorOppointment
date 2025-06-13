import React from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    navigate("/doctor");             // Redirect to login page
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome to Doctor Dashboard</h1>
      <button
        onClick={handleLogout}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#d9534f',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default DoctorDashboard;
