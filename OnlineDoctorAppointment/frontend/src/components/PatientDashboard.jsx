// Full Updated PatientDashboard.jsx with Doctor and Appointment Pagination

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientProfile from './PatientProfile';
import ChangePassword from './ChangePassword';
import Popup from './Popup';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [popup, setPopup] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');

  // Doctor Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 3;
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  // Appointment Pagination
  const [appointmentPage, setAppointmentPage] = useState(1);
  const appointmentsPerPage = 6;
  const indexOfLastAppointment = appointmentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

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
        if (data.success) setUser(data.user);
        else navigate("/patient");
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/get-doctors");
        const data = await res.json();
        if (data.doctors) setDoctors(data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchUserData();
    fetchDoctors();
  }, [navigate]);

  useEffect(() => {
    let intervalId;

    const fetchAppointments = async () => {
      if (!user._id) return;
      try {
        const res = await fetch("http://localhost:5000/api/get-appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientUserId: user._id }),
        });
        const data = await res.json();
        if (data.success) setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    intervalId = setInterval(fetchAppointments, 5000);
    fetchAppointments();
    return () => clearInterval(intervalId);
  }, [user._id]);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLoggingOut(false);
      navigate("/patient");
    }, 1500);
  };

  const handleMakeAppointment = (doctorId) => {
    const alreadyBooked = appointments.some(
      (appt) => appt.doctorUserId === doctorId
    );
    if (alreadyBooked) {
      setPopup({ type: "error", message: "You already booked this doctor." });
      setTimeout(() => setPopup(null), 3000);
    } else {
      setSelectedDoctorId(doctorId);
      setAppointmentDate('');
      setShowConfirmModal(true);
    }
  };

  const confirmAppointment = async () => {
    if (!appointmentDate) return;
    setLoadingAppointment(true);
    try {
      const res = await fetch("http://localhost:5000/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientUserId: user._id,
          doctorUserId: selectedDoctorId,
          appointmentDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPopup({ type: "success", message: "✅ Appointment booked!" });
        setAppointments((prev) => [
          ...prev,
          {
            patientUserId: user._id,
            doctorUserId: selectedDoctorId,
            date: appointmentDate,
            status: 'pending'
          }
        ]);
      } else {
        setPopup({ type: "error", message: "❌ Failed: " + data.msg });
      }
    } catch (err) {
      console.error("❌ Booking error:", err);
      setPopup({ type: "error", message: "❌ Something went wrong." });
    } finally {
      setLoadingAppointment(false);
      setShowConfirmModal(false);
      setSelectedDoctorId(null);
      setAppointmentDate('');
      setTimeout(() => setPopup(null), 3000);
    }
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
          {/* <li className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>💳 Payments</li> */}
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</li>
          <li className={activeTab === 'changePassword' ? 'active' : ''} onClick={() => setActiveTab('changePassword')}>🔐 Change Password</li>
          <li className="logout" onClick={() => setShowLogoutModal(true)}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h1>Welcome, {user.firstName} 👋</h1>
            <h2>Available Doctors:</h2>
            <div className="doctor-cards-container">
              {currentDoctors.map((doc) => (
                <div key={doc._id} className="doctor-card">
                  <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" alt="Doctor" className="doctor-image" />
                  <h3>Dr. {doc.firstName} {doc.lastName}</h3>
                  <p><strong>Specialization:</strong> {doc.specialization}</p>
                  <p><strong>City:</strong> {doc.city}</p>
                  <p><strong>Hospital:</strong> {doc.hospital}</p>
                  <p><strong>Experience:</strong> {doc.experience} years</p>
                  <p><strong>Time:</strong> {doc.availableTime}</p>
                  <p><strong>Fee:</strong> Rs. {doc.fee}</p>
                  <p><strong>Description:</strong> {doc.description}</p>
                  <button className="appointment-button" onClick={() => handleMakeAppointment(doc._id)}>📅 Make Appointment</button>
                </div>
              ))}
            </div>
            <div className="pagination-controls">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>⬅ Previous</button>
              <span>Page {currentPage}</span>
              <button onClick={() => setCurrentPage((prev) => indexOfLastDoctor < doctors.length ? prev + 1 : prev)} disabled={indexOfLastDoctor >= doctors.length}>Next ➡</button>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-tab">
            <h2>📅 Your Appointments</h2>
            {appointments.length === 0 ? (
              <p>You haven't booked any appointments yet.</p>
            ) : (
              <>
                <div className="appointments-list">
                  {currentAppointments.map((appt, index) => {
                    const doctor = doctors.find(doc => doc._id === appt.doctorUserId);
                    const rawStatus = appt.status || 'pending';
                    const status = rawStatus.toLowerCase();
                    const statusClass = status === 'confirmed' ? 'status-confirmed' : status === 'rejected' ? 'status-rejected' : 'status-pending';
                    const displayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

                    return (
                      <div key={index} className="appointment-card">
                        <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" alt="Doctor" className="appointment-doctor-image" />
                        <div className="appointment-details">
                          <h3>Dr. {doctor?.firstName} {doctor?.lastName}</h3>
                          <p><strong>Specialization:</strong> {doctor?.specialization}</p>
                          <p><strong>Hospital:</strong> {doctor?.hospital}</p>
                          <p><strong>City:</strong> {doctor?.city}</p>
                          <p><strong>Fee:</strong> Rs. {doctor?.fee}</p>
                          <p><strong>Date:</strong> {appt.date ? new Date(appt.date).toDateString() : 'N/A'}</p>
                          <p><strong>Time:</strong> {doctor?.availableTime}</p>
                          <p><strong>Status:</strong> <span className={`appointment-status ${statusClass}`}>{displayStatus}</span></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pagination-controls">
                  <button onClick={() => setAppointmentPage((prev) => Math.max(prev - 1, 1))} disabled={appointmentPage === 1}>⬅ Previous</button>
                  <span>Page {appointmentPage}</span>
                  <button onClick={() => setAppointmentPage((prev) => indexOfLastAppointment < appointments.length ? prev + 1 : prev)} disabled={indexOfLastAppointment >= appointments.length}>Next ➡</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* {activeTab === 'payments' && <h2>Payments section coming soon...</h2>} */}
        {activeTab === 'profile' && <PatientProfile userId={user._id} />}
        {activeTab === 'changePassword' && <ChangePassword userId={user._id} />}
      </main>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-buttons">
              <button onClick={handleLogout} disabled={loggingOut}>{loggingOut ? <>Logging out... <span className="logout-spinner"></span></> : "Yes"}</button>
              <button onClick={() => setShowLogoutModal(false)} disabled={loggingOut}>No</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select Appointment Date</h3>
            <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
            <div className="modal-buttons">
              <button onClick={confirmAppointment} disabled={loadingAppointment || !appointmentDate}>{loadingAppointment ? <>Booking... <span className="spinner"></span></> : "Confirm"}</button>
              <button onClick={() => setShowConfirmModal(false)} disabled={loadingAppointment}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {popup && <Popup type={popup.type} message={popup.message} />}
    </div>
  );
};

export default PatientDashboard;
