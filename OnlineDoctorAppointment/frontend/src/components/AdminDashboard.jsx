import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    navigate("/admin");             // Redirect to login page
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome to Admin Dashboard</h1>
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

export default AdminDashboard;
