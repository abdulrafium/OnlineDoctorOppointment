import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from './ChangePassword';
import DoctorProfile from './DoctorProfile';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false); // 🟡 Added for spinner

  //Backend API call to fetch user data

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLoggingOut(false);
      navigate("/doctor");
    }, 1500); // Simulated delay
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="profile-box">
          <img src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Doctor Profile" className="profile-image" />
          <h3>Dr. {user.firstName} {user.lastName}</h3>
        </div>
        <ul className="nav-links">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>🏠 Dashboard</li>
          <li className={activeTab === 'patients' ? 'active' : ''} onClick={() => setActiveTab('patients')}>👥 Patients</li>
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</li>
          <li className={activeTab === 'changePassword' ? 'active' : ''} onClick={() => setActiveTab('changePassword')}>🔐 Change Password</li>
          <li className="logout" onClick={() => setShowLogoutModal(true)}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h1>Welcome, Dr. {user.firstName} 👋</h1>
            <p>This is your doctor dashboard where you can manage your appointments and view your patients.</p>
          </div>
        )}
        {activeTab === 'patients' && <h2>Patients section coming soon...</h2>}
        {activeTab === 'profile' && <DoctorProfile userId={user._id} />}
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

export default DoctorDashboard;
