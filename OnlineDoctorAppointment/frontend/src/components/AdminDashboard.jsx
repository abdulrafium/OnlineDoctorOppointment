import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { DoctorRegistration } from './DoctorRegistration';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 6;
  const indexOfLast = currentPage * appointmentsPerPage;
  const indexOfFirst = indexOfLast - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/get-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/get-doctors");
        const data = await res.json();
        if (data.success) {
          setDoctors(data.doctors);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  //Fetch Doctor Appointments Backend Logic

  //Handle Status Update (Confirm/Reject ) Backend Logic
  

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
          <div className="tab-content appointments-tab">
            <h2>Doctor Appointments</h2>

            {appointments.length === 0 ? (
              <p>No appointments found.</p>
            ) : (
              <>
                <div className="appointments-list">
                  {currentAppointments.map((appointment, index) => {
                    const doctor = doctors.find(
                      doc =>
                        doc.firstName === appointment.doctorFirstName &&
                        doc.lastName === appointment.doctorLastName
                    );

                    return (
                      <div key={index} className="appointment-card">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png"
                          alt="Doctor"
                          className="appointment-doctor-image"
                        />
                        <div className="appointment-details">
                          <h3>{appointment.patientFirstName} {appointment.patientLastName}</h3>
                          <p><strong>Father:</strong> {appointment.patientFatherName}</p>
                          <p><strong>Doctor:</strong> Dr. {appointment.doctorFirstName} {appointment.doctorLastName}</p>
                          <p><strong>Specialization:</strong> {appointment.doctorSpecialization}</p>
                          <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                          <p><strong>Time:</strong>{doctor?.availableTime || 'N/A'}</p>
                          <p><strong>Fee:</strong> Rs. {doctor?.fee || 'N/A'}</p>
                          <p>
                            <strong>Status:</strong>{' '}
                            <span className={`status-${appointment.status.toLowerCase()}`}>
                              {appointment.status}
                            </span>
                          </p>
                          {appointment.status === "Pending" && (
                            <div className="appointment-actions">
                              <button onClick={() => handleStatusUpdate(appointment._id, "Confirmed")} className="confirm-btn">Confirm</button>
                              <button onClick={() => handleStatusUpdate(appointment._id, "Rejected")} className="reject-btn">Reject</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ⬅ Previous
                  </button>
                  <span>Page {currentPage}</span>
                  <button
                    onClick={() =>
                      setCurrentPage(prev =>
                        indexOfLast < appointments.length ? prev + 1 : prev
                      )
                    }
                    disabled={indexOfLast >= appointments.length}
                  >
                    Next ➡
                  </button>
                </div>
              </>
            )}
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
