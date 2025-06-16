import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientProfile from './PatientProfile';
import './PatientDashboard.css';
import ChangePassword from './ChangePassword';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false); // 🟡 Spinner state

  //Backend API Call to fetch user data

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLoggingOut(false);
      navigate("/patient");
    }, 1500); // Simulate delay
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="profile-box">
          <img src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png" alt="Patient Profile" className="profile-image" />
          <h3>{user.firstName} {user.lastName}</h3>
        </div>
        <ul className="nav-links">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>🏠 Dashboard</li>
          <li className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>📅 Appointments</li>
          <li className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>💳 Payments</li>
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</li>
          <li className={activeTab === 'changePassword' ? 'active' : ''} onClick={() => setActiveTab('changePassword')}>🔐 Change Password</li>
          <li className="logout" onClick={() => setShowLogoutModal(true)}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h1>Welcome, {user.firstName} 👋</h1>
            <p>This is your patient dashboard where you can manage appointments, and more.</p>
          </div>
        )}

        {activeTab === 'profile' && <PatientProfile userId={user._id} />}
        {activeTab === 'appointments' && <h2>Appointments section coming soon...</h2>}
        {activeTab === 'payments' && <h2>Payments section coming soon...</h2>}
        {activeTab === 'changePassword' && <ChangePassword userId={user._id} />}
      </main>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-buttons">
              <button onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? (
                  <>
                    Logging out... <span className="logout-spinner"></span>
                  </>
                ) : "Yes"}
              </button>
              <button onClick={() => setShowLogoutModal(false)} disabled={loggingOut}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
