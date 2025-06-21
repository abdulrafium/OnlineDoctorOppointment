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
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loadingStatus, setLoadingStatus] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 6;
  const indexOfLast = currentPage * appointmentsPerPage;
  const indexOfFirst = indexOfLast - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirst, indexOfLast);

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

  useEffect(() => {
    if (activeTab === "appointments") {
      const fetchAppointments = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/get-all-appointments");
          const data = await res.json();
          if (data.success) {
            setAppointments(data.appointments);
            const today = new Date().toDateString();
            const todayAppointments = data.appointments.filter(
              (appt) => new Date(appt.date).toDateString() === today
            );
            setFilteredAppointments(todayAppointments);
          } else {
            setAppointments([]);
            setFilteredAppointments([]);
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }
      };

      fetchAppointments();
    }
  }, [activeTab]);

  const handleStatusUpdate = async (id, newStatus) => {
    const key = id + newStatus;
    setLoadingStatus(prev => ({ ...prev, [key]: true }));

    try {
      const res = await fetch("http://localhost:5000/api/update-appointment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setAppointments(prev =>
          prev.map(app => app._id === id ? { ...app, status: newStatus } : app)
        );
        setFilteredAppointments(prev =>
          prev.map(app => app._id === id ? { ...app, status: newStatus } : app)
        );
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
    } finally {
      setLoadingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLoggingOut(false);
      navigate("/admin");
    }, 1500);
  };

  const handleFilterDate = (e) => {
    const date = e.target.value;
    setFilterDate(date);

    if (!date) return;

    const selected = new Date(date).toDateString();
    const filtered = appointments.filter(
      (appt) => new Date(appt.date).toDateString() === selected
    );
    setFilteredAppointments(filtered);
    setCurrentPage(1);
  };

  const handleShowAll = () => {
    setFilterDate('');
    setFilteredAppointments(appointments);
    setCurrentPage(1);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="profile-box">
          <img src="https://cdn-icons-png.flaticon.com/512/2922/2922522.png" alt="Admin Profile" className="profile-image" />
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

            <div className="appointment-filter-bar">
              <input type="date" value={filterDate} onChange={handleFilterDate} />
              <button onClick={handleShowAll} className="show-all-btn">Show All</button>
            </div>

            {filteredAppointments.length === 0 ? (
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
                          <p><strong>Time:</strong> {doctor?.availableTime || 'N/A'}</p>
                          <p><strong>Fee:</strong> Rs. {doctor?.fee || 'N/A'}</p>
                          <p>
                            <strong>Status:</strong>{' '}
                            <span className={`status-${appointment.status.toLowerCase()}`}>
                              {appointment.status}
                            </span>
                          </p>
                          {appointment.status === "Pending" && (
                            <div className="appointment-actions">
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, "Confirmed")}
                                className="confirm-btn"
                                disabled={loadingStatus[appointment._id + "Confirmed"]}
                              >
                                {loadingStatus[appointment._id + "Confirmed"] ? (
                                  <span className="spinner"></span>
                                ) : (
                                  "Confirm"
                                )}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, "Rejected")}
                                className="reject-btn"
                                disabled={loadingStatus[appointment._id + "Rejected"]}
                              >
                                {loadingStatus[appointment._id + "Rejected"] ? (
                                  <span className="spinner"></span>
                                ) : (
                                  "Reject"
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

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
                        indexOfLast < filteredAppointments.length ? prev + 1 : prev
                      )
                    }
                    disabled={indexOfLast >= filteredAppointments.length}
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
                  <>Logging out... <span className="logout-spinner"></span></>
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
