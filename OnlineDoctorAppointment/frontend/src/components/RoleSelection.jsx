import React from 'react';
import { Link } from 'react-router-dom';
import './RoleSelection.css'; // Import the CSS file

function RoleSelection() {
  return (
    <div className="role-selection-container">
      <h2 className="role-selection-title">Select Your Role</h2>

      <Link to="/patient" className="role-button">Patient</Link>
      <br /><br />
      <Link to="/doctor" className="role-button">Doctor</Link>
      <br /><br />
      <Link to="/admin" className="role-button">Admin</Link>
      <br /><br />

      <p className="role-selection-footer">
        © 2025 Online Doctor Appointment System
      </p>
    </div>
  );
}

export default RoleSelection;
