'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

const PatientDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Toast ──
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Doctors list ──
  const [doctors, setDoctors] = useState([]);
  const [currentDocPage, setCurrentDocPage] = useState(1);
  const docsPerPage = 6;
  const indexOfLastDoc = currentDocPage * docsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoc, indexOfLastDoc);

  // ── Appointments ──
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [currentApptPage, setCurrentApptPage] = useState(1);
  const apptsPerPage = 6;
  const indexOfLastAppt = currentApptPage * apptsPerPage;
  const indexOfFirstAppt = indexOfLastAppt - apptsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppt, indexOfLastAppt);

  // ── Profile ──
  const [profileData, setProfileData] = useState({ cnic: '', mobile: '', gender: '', fatherName: '', city: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Fetch user ──
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/get-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await res.json();
        if (data.success) setUser(data.user);
        else router.push('/patient');
      } catch { addToast('Failed to load user data.', 'error'); }
    };
    fetchUserData();
  }, [router]);

  // ── Fetch doctors ──
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetch('/api/get-doctors')
        .then(r => r.json())
        .then(data => { if (data.success) setDoctors(data.doctors); })
        .catch(() => addToast('Failed to load doctors.', 'error'));
    }
  }, [activeTab]);

  // ── Fetch patient profile ──
  useEffect(() => {
    if (activeTab === 'profile' && user._id) {
      fetch(`/api/get-details/${user._id}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.details) {
            const d = data.details;
            setProfileData({ cnic: d.cnic || '', mobile: d.mobile || '', gender: d.gender || '', fatherName: d.fatherName || '', city: d.city || '', address: d.address || '' });
          }
        })
        .catch(() => {});
    }
  }, [activeTab, user._id]);

  // ── Fetch appointments ──
  useEffect(() => {
    if (activeTab === 'appointments' && user._id) {
      fetch('/api/get-appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user._id, role: 'Patient' }) })
        .then(r => r.json())
        .then(data => {
          if (data.success) { setAppointments(data.appointments); setFilteredAppointments(data.appointments); }
        })
        .catch(() => addToast('Failed to load appointments.', 'error'));
    }
  }, [activeTab, user._id]);

  // ── Book Appointment ──
  const handleBookAppointment = async (doctor) => {
    if (!user._id) return;
    const appointmentDate = new Date().toISOString();
    try {
      const res = await fetch('/api/book-appointment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientUserId: user._id, doctorUserId: doctor._id, appointmentDate }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Appointment requested! Awaiting doctor confirmation.', 'success');
        setActiveTab('appointments');
      } else {
        if (data.msg && data.msg.toLowerCase().includes('profile')) {
          addToast('Please complete your profile before booking.', 'error');
          setActiveTab('profile');
        } else {
          addToast(data.msg || 'Failed to book appointment.', 'error');
        }
      }
    } catch { addToast('Network error. Please try again.', 'error'); }
  };

  // ── Save Patient Profile ──
  const handleSaveProfile = async () => {
    const { cnic, mobile, gender, fatherName, city, address } = profileData;
    if (!cnic || !mobile || !gender || !fatherName || !city || !address) {
      addToast('Please fill in all profile fields.', 'error'); return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch('/api/save-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, ...profileData }),
      });
      const data = await res.json();
      addToast(data.msg || 'Profile saved!', data.msg?.includes('error') || data.msg?.includes('exists') ? 'error' : 'success');
    } catch { addToast('Network error. Please try again.', 'error'); }
    finally { setSavingProfile(false); }
  };

  const handleFilterDate = (e) => {
    const date = e.target.value;
    setFilterDate(date);
    if (!date) { setFilteredAppointments(appointments); return; }
    setFilteredAppointments(appointments.filter(a => new Date(a.date).toDateString() === new Date(date).toDateString()));
    setCurrentApptPage(1);
  };
  const handleShowAll = () => { setFilterDate(''); setFilteredAppointments(appointments); setCurrentApptPage(1); };
  const handleLogout = () => { setLoggingOut(true); setTimeout(() => { localStorage.removeItem('token'); setLoggingOut(false); router.push('/patient'); }, 1500); };

  const inputClass = "w-full py-2.5 px-4 rounded-xl border border-[#cbd5e0] focus:border-[#4fadad] focus:ring-4 focus:ring-[#4fadad]/20 outline-none transition-all duration-300 bg-white/60 text-[#2d3748]";
  const selectClass = `${inputClass} bg-white`;

  return (
    <div className="flex flex-col md:flex-row font-sans bg-gradient-to-br from-[#f0f4f8] to-[#e2eafc] min-h-screen">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Sidebar */}
      <aside className="w-full md:w-[260px] bg-white/75 backdrop-blur-xl px-5 py-8 shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-b md:border-r border-white/60 flex flex-col items-center z-10 md:min-h-screen">
        <div className="text-center mb-10 w-full flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Patient Profile" className="w-[90px] h-[90px] rounded-full object-cover shadow-[0_8px_16px_rgba(0,0,0,0.1)] border-[3px] border-white transition-transform duration-300 hover:scale-110" />
          <h3 className="mt-4 mb-1 text-[18px] font-bold text-[#1a202c]">{user?.firstName || ''} {user?.lastName || ''}</h3>
          <p className="text-[14px] text-[#718096]">@{user?.username || ''}</p>
        </div>
        <ul className="list-none p-0 w-full flex flex-col gap-2">
          {[{ key: 'dashboard', label: '🏠 Find Doctors' }, { key: 'appointments', label: '📅 My Appointments' }, { key: 'profile', label: '👤 My Profile' }].map(({ key, label }) => (
            <li key={key}
              className={`px-5 py-3 text-[15px] font-semibold cursor-pointer rounded-xl transition-all duration-300 ${activeTab === key ? 'bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white shadow-[0_4px_12px_rgba(44,122,123,0.3)]' : 'text-[#4a5568] hover:bg-[#4fadad]/10 hover:translate-x-1 hover:text-[#2c7a7b]'}`}
              onClick={() => setActiveTab(key)}
            >{label}</li>
          ))}
          <li className="px-5 py-3 text-[15px] font-semibold cursor-pointer rounded-xl transition-all duration-300 text-[#e53e3e] hover:bg-[#e53e3e]/10 hover:translate-x-1" onClick={() => setShowLogoutModal(true)}>🚪 Logout</li>
        </ul>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 md:p-12 overflow-y-auto">

        {/* ── Find Doctors ── */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#1a202c] tracking-tight">Find a Doctor 🩺</h1>
            <p className="text-[#4a5568] mb-6 text-sm">
              ⚠️ Please complete your <span className="font-bold text-[#2c7a7b] cursor-pointer underline" onClick={() => setActiveTab('profile')}>profile</span> before booking.
            </p>
            {doctors.length === 0 ? <p className="text-[#4a5568]">No doctors available currently.</p> : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentDoctors.map((doc, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(79,173,173,0.15)] flex flex-col items-center">
                      <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" alt="Doctor" className="w-[90px] h-[90px] object-cover mb-4 rounded-full border-[3px] border-white shadow-[0_8px_15px_rgba(0,0,0,0.1)]" />
                      <h3 className="text-lg font-bold text-[#2d3748] mb-1">Dr. {doc.firstName} {doc.lastName}</h3>
                      <span className="bg-[#e2faf8] text-[#2c7a7b] text-xs font-bold px-3 py-0.5 rounded-full mb-2">{doc.specialization}</span>
                      <p className="text-[#718096] text-sm"><strong>Exp:</strong> {doc.experience} Yrs</p>
                      <p className="text-[#718096] text-sm"><strong>Hospital:</strong> {doc.hospital}</p>
                      <p className="text-[#718096] text-sm"><strong>Time:</strong> {doc.availableTime}</p>
                      <p className="text-[#718096] text-sm mb-4"><strong>Fee:</strong> Rs. {doc.fee}</p>
                      <button onClick={() => handleBookAppointment(doc)} className="mt-auto py-2 px-6 bg-gradient-to-br from-[#48bb78] to-[#38a169] text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg w-full">
                        Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center mt-8 gap-4">
                  <button onClick={() => setCurrentDocPage(p => Math.max(p - 1, 1))} disabled={currentDocPage === 1} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">⬅ Previous</button>
                  <span className="font-bold text-[#2d3748]">Page {currentDocPage}</span>
                  <button onClick={() => setCurrentDocPage(p => indexOfLastDoc < doctors.length ? p + 1 : p)} disabled={indexOfLastDoc >= doctors.length} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">Next ➡</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── My Appointments ── */}
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#1a202c] tracking-tight">My Appointments</h2>
            <div className="flex flex-wrap gap-4 items-center mb-8 bg-white/60 p-4 rounded-[15px]">
              <input type="date" value={filterDate} onChange={handleFilterDate} className="py-2 px-4 rounded-xl border border-[#cbd5e0] focus:border-[#4fadad] outline-none transition-all duration-300 bg-white" />
              <button onClick={handleShowAll} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg">Show All</button>
            </div>
            {filteredAppointments.length === 0 ? <p className="text-[#4a5568]">No appointments found.</p> : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentAppointments.map((appt, i) => {
                    let sc = 'bg-[#feebc8] text-[#7b341e]';
                    if (appt.status === 'Confirmed') sc = 'bg-[#c6f6d5] text-[#22543d]';
                    if (appt.status === 'Rejected') sc = 'bg-[#fed7d7] text-[#822727]';
                    return (
                      <div key={i} className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(79,173,173,0.15)]">
                        <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" alt="Doctor" className="w-[70px] h-[70px] rounded-full object-cover shadow-[0_4px_10px_rgba(0,0,0,0.1)]" />
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-xl font-bold text-[#2d3748] mb-1">Dr. {appt.doctorFirstName} {appt.doctorLastName}</h3>
                          <p className="text-[#718096] text-sm my-1"><strong>Specialization:</strong> {appt.doctorSpecialization}</p>
                          <p className="text-[#718096] text-sm my-1"><strong>Hospital:</strong> {appt.doctorHospital}</p>
                          <p className="text-[#718096] text-sm my-1"><strong>Date:</strong> {new Date(appt.date).toLocaleDateString()}</p>
                          <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${sc}`}>{appt.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center items-center mt-8 gap-4">
                  <button onClick={() => setCurrentApptPage(p => Math.max(p - 1, 1))} disabled={currentApptPage === 1} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">⬅ Previous</button>
                  <span className="font-bold text-[#2d3748]">Page {currentApptPage}</span>
                  <button onClick={() => setCurrentApptPage(p => indexOfLastAppt < filteredAppointments.length ? p + 1 : p)} disabled={indexOfLastAppt >= filteredAppointments.length} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">Next ➡</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Profile ── */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#1a202c] tracking-tight">👤 My Profile</h2>
            <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 max-w-2xl">
              <p className="text-sm text-[#718096] mb-5">⚠️ Your profile must be completed before booking appointments.</p>
              {/* Read-only info */}
              <div className="bg-[#f0fafa] border border-[#4fadad]/30 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
                <div><p className="font-semibold text-[#2d3748]">Name</p><p className="text-[#4a5568]">{user?.firstName} {user?.lastName}</p></div>
                <div><p className="font-semibold text-[#2d3748]">Email</p><p className="text-[#4a5568]">{user?.email}</p></div>
                <div><p className="font-semibold text-[#2d3748]">Username</p><p className="text-[#4a5568]">@{user?.username}</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">CNIC</label>
                  <input type="text" placeholder="12345-1234567-1" value={profileData.cnic} onChange={e => setProfileData(p => ({ ...p, cnic: e.target.value }))} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Mobile Number</label>
                  <input type="tel" placeholder="03xx-xxxxxxx" value={profileData.mobile} onChange={e => setProfileData(p => ({ ...p, mobile: e.target.value }))} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Gender</label>
                  <select value={profileData.gender} onChange={e => setProfileData(p => ({ ...p, gender: e.target.value }))} className={selectClass}>
                    <option value="">Select Gender</option><option>Male</option><option>Female</option>
                  </select></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Father's Name</label>
                  <input type="text" placeholder="Father's full name" value={profileData.fatherName} onChange={e => setProfileData(p => ({ ...p, fatherName: e.target.value }))} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">City</label>
                  <input type="text" placeholder="Your city" value={profileData.city} onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Address</label>
                  <input type="text" placeholder="Home address" value={profileData.address} onChange={e => setProfileData(p => ({ ...p, address: e.target.value }))} className={inputClass} /></div>
              </div>
              <button onClick={handleSaveProfile} disabled={savingProfile} className="mt-6 w-full py-3 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                {savingProfile ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '💾 Save Profile'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <div className="bg-white/95 p-10 rounded-[24px] text-center w-[350px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50">
            <h3 className="text-xl font-bold text-[#1a202c] mb-6">Are you sure you want to logout?</h3>
            <div className="flex justify-around gap-4">
              <button onClick={handleLogout} disabled={loggingOut} className="flex-1 py-3 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 flex items-center justify-center disabled:opacity-50">
                {loggingOut ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Yes'}
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 bg-gradient-to-br from-[#f56565] to-[#e53e3e] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
