import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { DoctorRegistration } from './DoctorRegistration'; // ✅ Make sure this is a default export

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  //Backend API call to fetch user data

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLoggingOut(false);
      navigate("/admin");
    }, 1500);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="profile-box">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2922/2922522.png"
            alt="Admin Profile"
            className="profile-image"
          />
          <h3>Admin {user?.firstName || ''} {user?.lastName || ''}</h3>
        </div>
        <ul className="nav-links">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>🏠 Dashboard</li>
          <li className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>📅 Doctor Appointments</li>
          <li className={activeTab === 'createDoctor' ? 'active' : ''} onClick={() => setActiveTab('createDoctor')}>➕ Create Doctor Account</li>
          <li className="logout" onClick={() => setShowLogoutModal(true)}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h1>Welcome, Admin {user?.firstName || ''} 👋</h1>
            <p>This is your admin dashboard where you can manage doctors and appointments.</p>
          </div>
        )}
        {activeTab === 'appointments' && (
          <div className="tab-content">
            <h2>Doctor Appointments</h2>
            <p>(Appointment confirmation/cancellation logic will go here...)</p>
          </div>
        )}
        {activeTab === 'createDoctor' && (
          <div className="tab-content">
            <h2>Create Doctor Account</h2>
            <DoctorRegistration role="Doctor" />
          </div>
        )}
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

export default AdminDashboard;
