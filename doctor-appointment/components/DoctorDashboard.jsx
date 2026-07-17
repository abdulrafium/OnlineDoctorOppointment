'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

const DoctorDashboard = () => {
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

  // ── Availability ──
  const [availableTime, setAvailableTime] = useState('');
  const [fee, setFee] = useState('');
  const [savingAvailability, setSavingAvailability] = useState(false);

  // ── Doctor Full Profile ──
  const [profileData, setProfileData] = useState({
    cnic: '', gender: '', specialization: '', city: '', hospital: '', experience: '', description: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Appointments ──
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loadingStatus, setLoadingStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 6;
  const indexOfLast = currentPage * appointmentsPerPage;
  const indexOfFirst = indexOfLast - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirst, indexOfLast);

  // ── Fetch user ──
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/get-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await res.json();
        if (data.success) { setUser(data.user); fetchDoctorDetails(data.user._id); }
        else router.push('/doctor');
      } catch { addToast('Failed to load user data.', 'error'); }
    };
    fetchUserData();
  }, [router]);

  const fetchDoctorDetails = async (userId) => {
    try {
      const res = await fetch(`/api/get-doctor-details/${userId}`);
      const data = await res.json();
      if (data.success && data.profile) {
        const p = data.profile;
        setAvailableTime(p.availableTime || '');
        setFee(p.fee || '');
        setProfileData({
          cnic: p.cnic !== 'N/A' ? p.cnic : '',
          gender: p.gender !== 'N/A' ? p.gender : '',
          specialization: p.specialization !== 'General' ? p.specialization : '',
          city: p.city !== 'N/A' ? p.city : '',
          hospital: p.hospital !== 'N/A' ? p.hospital : '',
          experience: p.experience !== '0' ? p.experience : '',
          description: p.description !== 'N/A' ? p.description : '',
        });
      }
    } catch { /* silent */ }
  };

  // ── Fetch appointments ──
  useEffect(() => {
    if (activeTab === 'appointments' && user._id) {
      const fetchAppointments = async () => {
        try {
          const res = await fetch('/api/get-appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user._id, role: 'Doctor' }) });
          const data = await res.json();
          if (data.success) {
            setAppointments(data.appointments);
            const today = new Date().toDateString();
            setFilteredAppointments(data.appointments.filter(a => new Date(a.date).toDateString() === today));
          } else { setAppointments([]); setFilteredAppointments([]); }
        } catch { addToast('Failed to load appointments.', 'error'); }
      };
      fetchAppointments();
    }
  }, [activeTab, user._id]);

  // ── Save Availability ──
  const handleSaveAvailability = async () => {
    if (!availableTime || !fee) { addToast('Please select a time slot and enter your fee.', 'error'); return; }
    setSavingAvailability(true);
    try {
      const res = await fetch('/api/save-availability', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, availableTime, fee }),
      });
      const data = await res.json();
      addToast(data.msg || (data.success ? 'Saved!' : 'Failed.'), data.success ? 'success' : 'error');
    } catch { addToast('Network error. Please try again.', 'error'); }
    finally { setSavingAvailability(false); }
  };

  // ── Save Full Doctor Profile ──
  const handleSaveProfile = async () => {
    const { cnic, gender, specialization, city, hospital, experience, description } = profileData;
    if (!cnic || !gender || !specialization || !city || !hospital || !experience || !fee || !description) {
      addToast('Please fill in all profile fields.', 'error'); return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch('/api/save-doctor-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, ...profileData, fee, availableTime }),
      });
      const data = await res.json();
      addToast(data.msg || (data.success ? 'Profile saved!' : 'Failed.'), data.success ? 'success' : 'error');
      if (data.success) fetchDoctorDetails(user._id);
    } catch { addToast('Network error. Please try again.', 'error'); }
    finally { setSavingProfile(false); }
  };

  // ── Appointment Status ──
  const handleStatusUpdate = async (id, newStatus) => {
    const key = id + newStatus;
    setLoadingStatus(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/update-appointment-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: id, status: newStatus }) });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        setFilteredAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        addToast(`Appointment ${newStatus.toLowerCase()} successfully.`, 'success');
      } else { addToast('Failed to update appointment status.', 'error'); }
    } catch { addToast('Network error.', 'error'); }
    finally { setLoadingStatus(prev => ({ ...prev, [key]: false })); }
  };

  const handleFilterDate = (e) => {
    const date = e.target.value;
    setFilterDate(date);
    if (!date) return;
    setFilteredAppointments(appointments.filter(a => new Date(a.date).toDateString() === new Date(date).toDateString()));
    setCurrentPage(1);
  };
  const handleShowAll = () => { setFilterDate(''); setFilteredAppointments(appointments); setCurrentPage(1); };
  const handleLogout = () => { setLoggingOut(true); setTimeout(() => { localStorage.removeItem('token'); setLoggingOut(false); router.push('/doctor'); }, 1500); };

  const inputClass = "w-full py-2.5 px-4 rounded-xl border border-[#cbd5e0] focus:border-[#4fadad] focus:ring-4 focus:ring-[#4fadad]/20 outline-none transition-all duration-300 bg-white/60 text-[#2d3748]";
  const selectClass = `${inputClass} bg-white`;

  return (
    <div className="flex flex-col md:flex-row font-sans bg-gradient-to-br from-[#f0f4f8] to-[#e2eafc] min-h-screen">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Sidebar */}
      <aside className="w-full md:w-[260px] bg-white/75 backdrop-blur-xl px-5 py-8 shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-b md:border-r border-white/60 flex flex-col items-center z-10 md:min-h-screen">
        <div className="text-center mb-10 w-full flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" alt="Doctor Profile" className="w-[90px] h-[90px] rounded-full object-cover shadow-[0_8px_16px_rgba(0,0,0,0.1)] border-[3px] border-white transition-transform duration-300 hover:scale-110" />
          <h3 className="mt-4 mb-1 text-[18px] font-bold text-[#1a202c]">Dr. {user?.firstName || ''} {user?.lastName || ''}</h3>
          <p className="text-[14px] text-[#718096]">@{user?.username || ''}</p>
        </div>
        <ul className="list-none p-0 w-full flex flex-col gap-2">
          {[{ key: 'dashboard', label: '🏠 Dashboard' }, { key: 'profile', label: '👤 My Profile' }, { key: 'appointments', label: '📅 Appointments' }].map(({ key, label }) => (
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

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-4 text-[#1a202c] tracking-tight">Welcome, Dr. {user?.firstName || ''} 👋</h1>
            <p className="text-lg text-[#4a5568] leading-relaxed mb-8">Manage your availability and view your appointments.</p>
            <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 max-w-md hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-xl font-bold text-[#2d3748] mb-5">⏰ Availability Settings</h2>
              <label className="block mb-1 font-semibold text-[#2d3748] text-sm">Available Time Period</label>
              <select value={availableTime} onChange={e => setAvailableTime(e.target.value)} className={`${selectClass} mb-4`}>
                <option value="">Select Time Period</option>
                <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM (Afternoon)</option>
                <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM (Evening)</option>
                <option value="08:00 PM - 11:00 PM">08:00 PM - 11:00 PM (Night)</option>
              </select>
              <label className="block mb-1 font-semibold text-[#2d3748] text-sm">Consultation Fee (Rs.)</label>
              <input type="number" placeholder="e.g. 1000" value={fee} onChange={e => setFee(e.target.value)} className={`${inputClass} mb-5`} />
              <button onClick={handleSaveAvailability} disabled={savingAvailability} className="w-full py-3 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                {savingAvailability ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '💾 Save Availability'}
              </button>
            </div>
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#1a202c] tracking-tight">👤 My Profile</h2>
            <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 max-w-2xl">
              <p className="text-sm text-[#718096] mb-6">Complete your profile so patients can find and book you.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">CNIC</label>
                  <input type="text" placeholder="12345-1234567-1" value={profileData.cnic} onChange={e => setProfileData(p => ({ ...p, cnic: e.target.value }))} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Gender</label>
                  <select value={profileData.gender} onChange={e => setProfileData(p => ({ ...p, gender: e.target.value }))} className={selectClass}>
                    <option value="">Select Gender</option><option>Male</option><option>Female</option>
                  </select></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Specialization</label>
                  <select value={profileData.specialization} onChange={e => setProfileData(p => ({ ...p, specialization: e.target.value }))} className={selectClass}>
                    <option value="">Select Specialization</option>
                    {['Cardiologist','Dermatologist','Neurologist','Pediatrician','Psychiatrist','Orthopedic','General Physician','Dentist','Gynecologist','ENT Specialist','Ophthalmologist','Urologist'].map(s => <option key={s}>{s}</option>)}
                  </select></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">City</label>
                  <input type="text" placeholder="City" value={profileData.city} onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Hospital / Clinic</label>
                  <input type="text" placeholder="Hospital or Clinic Name" value={profileData.hospital} onChange={e => setProfileData(p => ({ ...p, hospital: e.target.value }))} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Experience (Years)</label>
                  <input type="number" placeholder="Years of experience" value={profileData.experience} onChange={e => setProfileData(p => ({ ...p, experience: e.target.value }))} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Consultation Fee (Rs.)</label>
                  <input type="number" placeholder="e.g. 1000" value={fee} onChange={e => setFee(e.target.value)} className={inputClass} /></div>
                <div><label className="block mb-1 text-sm font-semibold text-[#2d3748]">Available Time</label>
                  <select value={availableTime} onChange={e => setAvailableTime(e.target.value)} className={selectClass}>
                    <option value="">Select Time</option>
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                    <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM (Afternoon)</option>
                    <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM (Evening)</option>
                    <option value="08:00 PM - 11:00 PM">08:00 PM - 11:00 PM (Night)</option>
                  </select></div>
                <div className="md:col-span-2"><label className="block mb-1 text-sm font-semibold text-[#2d3748]">About / Description</label>
                  <textarea rows={3} placeholder="Brief description about yourself..." value={profileData.description} onChange={e => setProfileData(p => ({ ...p, description: e.target.value }))} className={`${inputClass} resize-none`}></textarea></div>
              </div>
              <button onClick={handleSaveProfile} disabled={savingProfile} className="mt-6 w-full py-3 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                {savingProfile ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '💾 Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* ── Appointments Tab ── */}
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#1a202c] tracking-tight">Patient Appointments</h2>
            <div className="flex flex-wrap gap-4 items-center mb-8 bg-white/60 p-4 rounded-[15px]">
              <input type="date" value={filterDate} onChange={handleFilterDate} className="py-2 px-4 rounded-xl border border-[#cbd5e0] focus:border-[#4fadad] outline-none transition-all duration-300 bg-white" />
              <button onClick={handleShowAll} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg">Show All</button>
            </div>
            {filteredAppointments.length === 0 ? <p className="text-[#4a5568]">No appointments scheduled.</p> : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentAppointments.map((appt, index) => {
                    let sc = 'bg-[#feebc8] text-[#7b341e]';
                    if (appt.status === 'Confirmed') sc = 'bg-[#c6f6d5] text-[#22543d]';
                    if (appt.status === 'Rejected') sc = 'bg-[#fed7d7] text-[#822727]';
                    return (
                      <div key={index} className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(79,173,173,0.15)]">
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Patient" className="w-[70px] h-[70px] rounded-full object-cover shadow-[0_4px_10px_rgba(0,0,0,0.1)]" />
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-xl font-bold text-[#2d3748] mb-1">{appt.patientFirstName} {appt.patientLastName}</h3>
                          <p className="text-[#718096] text-sm my-1"><strong>Father:</strong> {appt.patientFatherName}</p>
                          <p className="text-[#718096] text-sm my-1"><strong>Mobile:</strong> {appt.patientMobile}</p>
                          <p className="text-[#718096] text-sm my-1"><strong>Date:</strong> {new Date(appt.date).toLocaleDateString()}</p>
                          <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${sc}`}>{appt.status}</span>
                          {appt.status === 'Pending' && (
                            <div className="mt-4 flex gap-2 justify-center sm:justify-start">
                              <button onClick={() => handleStatusUpdate(appt._id, 'Confirmed')} disabled={loadingStatus[appt._id + 'Confirmed']} className="py-1.5 px-4 bg-gradient-to-br from-[#48bb78] to-[#38a169] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 flex items-center min-w-[80px] justify-center">
                                {loadingStatus[appt._id + 'Confirmed'] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '✓ Confirm'}
                              </button>
                              <button onClick={() => handleStatusUpdate(appt._id, 'Rejected')} disabled={loadingStatus[appt._id + 'Rejected']} className="py-1.5 px-4 bg-gradient-to-br from-[#f56565] to-[#e53e3e] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 flex items-center min-w-[80px] justify-center">
                                {loadingStatus[appt._id + 'Rejected'] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '✗ Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center items-center mt-8 gap-4">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">⬅ Previous</button>
                  <span className="font-bold text-[#2d3748]">Page {currentPage}</span>
                  <button onClick={() => setCurrentPage(p => indexOfLast < filteredAppointments.length ? p + 1 : p)} disabled={indexOfLast >= filteredAppointments.length} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">Next ➡</button>
                </div>
              </>
            )}
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

export default DoctorDashboard;
