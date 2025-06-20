import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from './ChangePassword';
import DoctorProfile from './DoctorProfile';
import Popup from './Popup'; //Add this line
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctorFee, setDoctorFee] = useState(null);
  const [availableTime, setAvailableTime] = useState(""); // NEW
  const [popup, setPopup] = useState(null); // Popup message state
  const [timePeriod, setTimePeriod] = useState("AM"); //new

  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 3;
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
          fetchDoctorDetails(data.user._id); //Fetch time
        } else {
          navigate("/doctor");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchDoctorDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/get-doctor-details/${id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setAvailableTime(data.profile.availableTime || "");
      }
    } catch (err) {
      console.error("Error loading doctor details:", err);
    }
  };

  useEffect(() => {
    if (!user._id) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/doctor-appointments/${user._id}`);
        const data = await res.json();
        if (data.success) {
          const confirmed = data.appointments.filter(
            (appointment) => appointment.status === 'Confirmed'
          );
          setAppointments(confirmed);
          setDoctorFee(data.fee);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLoggingOut(false);
      navigate("/doctor");
    }, 1500);
  };

  const handleAvailableTimeSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/save-doctor-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          availableTime: `${availableTime} ${timePeriod}`, //store both
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPopup("Availability time saved successfully");
      } else {
        setPopup("Failed to save time ❌");
      }

      setTimeout(() => setPopup(null), 3000);

    } catch (error) {
      console.error("Error saving availability:", error);
      setPopup("Server error while saving time ❌");
      setTimeout(() => setPopup(null), 3000);
    }
  };



  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="profile-box">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
            alt="Doctor Profile"
            className="profile-image"
          />
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
            <p>This is your doctor dashboard where you can manage your appointments and set your available time.</p>

            {/*Availability Time Section */}
            <div className="availability-card">
              <h2>Set Your Available Time</h2>
              <form onSubmit={handleAvailableTimeSave}>
                <label htmlFor="availableTime">Available Time:</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="time"
                    id="availableTime"
                    name="availableTime"
                    required
                    value={availableTime}
                    onChange={(e) => setAvailableTime(e.target.value)}
                  />
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="time-period-select" // add class
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>

                </div>
                <button type="submit">Save Time</button>
              </form>

            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="tab-content appointments-tab">
            <h2>Confirmed Appointments</h2>
            {appointments.length === 0 ? (
              <p>No confirmed appointments found.</p>
            ) : (
              <>
                <div className="appointments-list">
                  {currentAppointments.map((appointment, index) => (
                    <div key={index} className="appointment-card">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png"
                        alt="Patient"
                        className="appointment-doctor-image"
                      />
                      <div className="appointment-details">
                        <h3>{appointment.patientFirstName} {appointment.patientLastName}</h3>
                        <p><strong>Father:</strong> {appointment.patientFatherName}</p>
                        <p><strong>Doctor:</strong> Dr. {appointment.doctorFirstName} {appointment.doctorLastName}</p>
                        <p><strong>Specialization:</strong> {appointment.doctorSpecialization}</p>
                        <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                        <p><strong>Fee:</strong> Rs. {doctorFee || 'N/A'}</p>
                        <p>
                          <strong>Status:</strong>{' '}
                          <span className={`status-${appointment.status.toLowerCase()}`}>
                            {appointment.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pagination-controls">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>⬅ Previous</button>
                  <span>Page {currentPage}</span>
                  <button
                    onClick={() => setCurrentPage(prev => indexOfLast < appointments.length ? prev + 1 : prev)}
                    disabled={indexOfLast >= appointments.length}
                  >
                    Next ➡
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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
                  <>Logging out... <span className="logout-spinner"></span></>
                ) : "Yes"}
              </button>
              <button onClick={() => setShowLogoutModal(false)} disabled={loggingOut}>No</button>
            </div>
          </div>
        </div>
      )}

      {/*Show popup */}
      {popup && <Popup message={popup} onClose={() => setPopup(null)} />}
    </div>
  );
};

export default DoctorDashboard;
