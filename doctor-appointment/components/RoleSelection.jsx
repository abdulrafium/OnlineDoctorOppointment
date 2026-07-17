'use client';
import React from 'react';
import Link from 'next/link';
import '../styles/RoleSelection.css';

function RoleSelection() {
  return (
    <div className="role-selection-container">
      <h2 className="role-selection-title">Select Your Role</h2>
      <Link href="/patient" className="role-button">Patient</Link>
      <br /><br />
      <Link href="/doctor" className="role-button">Doctor</Link>
      <br /><br />
      <Link href="/admin" className="role-button">Admin</Link>
      <br /><br />
      <p className="role-selection-footer">
        © 2025 Online Doctor Appointment System
      </p>
    </div>
  );
}

export default RoleSelection;
