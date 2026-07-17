'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorRegistration } from './DoctorRegistration';
import Toast from './Toast';

const AdminDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // ── Modals ──
  const [deleteAccountId, setDeleteAccountId] = useState(null);
  const [deleteApptId, setDeleteApptId] = useState(null);
  const [deleteAllAppts, setDeleteAllAppts] = useState(false);

  // ── Toast ──
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [appointmentsFilterDate, setAppointmentsFilterDate] = useState('');
  
  const [accounts, setAccounts] = useState([]);
  
  const [loadingStatus, setLoadingStatus] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const [currentApptPage, setCurrentApptPage] = useState(1);
  const appointmentsPerPage = 6;
  const indexOfLastAppt = currentApptPage * appointmentsPerPage;
  const indexOfFirstAppt = indexOfLastAppt - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppt, indexOfLastAppt);

  const [currentAccountPage, setCurrentAccountPage] = useState(1);
  const accountsPerPage = 6;
  const indexOfLastAccount = currentAccountPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = accounts.slice(indexOfFirstAccount, indexOfLastAccount);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/get-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await res.json();
        if (data.success) setUser(data.user);
        else router.push('/admin');
      } catch (error) { console.error('Error fetching user:', error); }
    };
    fetchUserData();
  }, [router]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setAccounts(data.users);
      else setAccounts([]);
    } catch (error) { console.error('Error fetching accounts:', error); }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/get-all-appointments');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
        setFilteredAppointments(data.appointments);
      } else { setAppointments([]); setFilteredAppointments([]); }
    } catch (error) { console.error('Error fetching appointments:', error); }
  };

  useEffect(() => {
    if (activeTab === 'accounts') fetchAccounts();
    if (activeTab === 'appointments') fetchAppointments();
  }, [activeTab]);

  const handleStatusUpdate = async (id, newStatus) => {
    const key = id + newStatus;
    setLoadingStatus(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/update-appointment-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: id, status: newStatus }) });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(app => app._id === id ? { ...app, status: newStatus } : app));
        setFilteredAppointments(prev => prev.map(app => app._id === id ? { ...app, status: newStatus } : app));
        addToast(`Appointment status updated to ${newStatus}`, 'success');
      } else {
        addToast('Failed to update status', 'error');
      }
    } catch (error) { 
      console.error('Error updating appointment status:', error); 
      addToast('Network error while updating status', 'error');
    }
    finally { setLoadingStatus(prev => ({ ...prev, [key]: false })); }
  };

  const handleDeleteAccount = (id) => setDeleteAccountId(id);
  const confirmDeleteAccount = async () => {
    if (!deleteAccountId) return;
    const id = deleteAccountId;
    setActionLoading(true);
    setDeleteAccountId(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Account deleted successfully', 'success');
        fetchAccounts();
      } else {
        addToast('Failed to delete account', 'error');
      }
    } catch (error) { 
      console.error('Error deleting account:', error); 
      addToast('Network error while deleting account', 'error');
    }
    finally { setActionLoading(false); }
  };

  const handleDeleteAppointment = (id) => setDeleteApptId(id);
  const confirmDeleteAppointment = async () => {
    if (!deleteApptId) return;
    const id = deleteApptId;
    setActionLoading(true);
    setDeleteApptId(null);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Appointment deleted successfully', 'success');
        fetchAppointments();
      } else {
        addToast('Failed to delete appointment', 'error');
      }
    } catch (error) { 
      console.error('Error deleting appointment:', error); 
      addToast('Network error while deleting appointment', 'error');
    }
    finally { setActionLoading(false); }
  };

  const handleDeleteAllAppointments = () => setDeleteAllAppts(true);
  const confirmDeleteAllAppointments = async () => {
    setActionLoading(true);
    setDeleteAllAppts(false);
    try {
      const res = await fetch(`/api/admin/appointments`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('All appointments deleted successfully', 'success');
        fetchAppointments();
      } else {
        addToast('Failed to delete all appointments', 'error');
      }
    } catch (error) { 
      console.error('Error deleting all appointments:', error); 
      addToast('Network error while deleting all appointments', 'error');
    }
    finally { setActionLoading(false); }
  };

  const handleLogout = () => { setLoggingOut(true); setTimeout(() => { localStorage.removeItem('token'); setLoggingOut(false); router.push('/admin'); }, 1500); };

  const handleFilterDate = (e) => {
    const date = e.target.value;
    setAppointmentsFilterDate(date);
    if (!date) {
      setFilteredAppointments(appointments);
      return;
    }
    setFilteredAppointments(appointments.filter(a => new Date(a.date).toDateString() === new Date(date).toDateString()));
    setCurrentApptPage(1);
  };

  const handleShowAll = () => { setAppointmentsFilterDate(''); setFilteredAppointments(appointments); setCurrentApptPage(1); };

  return (
    <div className="flex flex-col md:flex-row font-sans bg-gradient-to-br from-[#f0f4f8] to-[#e2eafc] min-h-screen">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <aside className="w-full md:w-[260px] bg-white/75 backdrop-blur-xl px-5 py-8 shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-b md:border-r border-white/60 flex flex-col items-center z-10 md:min-h-screen">
        <div className="text-center mb-10 w-full flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/2922/2922522.png" alt="Admin Profile" className="w-[90px] h-[90px] rounded-full object-cover shadow-[0_8px_16px_rgba(0,0,0,0.1)] border-[3px] border-white transition-transform duration-300 hover:scale-110" />
          <h3 className="mt-4 mb-1 text-[18px] font-bold text-[#1a202c]">Admin {user?.firstName || ''} {user?.lastName || ''}</h3>
        </div>
        <ul className="list-none p-0 w-full flex flex-col gap-2">
          {['dashboard', 'accounts', 'appointments', 'createDoctor'].map((tab) => (
            <li key={tab} 
              className={`px-5 py-3 text-[15px] font-semibold cursor-pointer rounded-xl transition-all duration-300 ease-in-out ${activeTab === tab ? 'bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white shadow-[0_4px_12px_rgba(44,122,123,0.3)]' : 'text-[#4a5568] hover:bg-[#4fadad]/10 hover:translate-x-1 hover:text-[#2c7a7b]'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'dashboard' && '🏠 Dashboard'}
              {tab === 'accounts' && '👥 Users & Doctors'}
              {tab === 'appointments' && '📅 Appointment History'}
              {tab === 'createDoctor' && '➕ Create Doctor'}
            </li>
          ))}
          <li className="px-5 py-3 text-[15px] font-semibold cursor-pointer rounded-xl transition-all duration-300 ease-in-out text-[#e53e3e] hover:bg-[#e53e3e]/10 hover:translate-x-1 hover:text-[#c53030]" onClick={() => setShowLogoutModal(true)}>
            🚪 Logout
          </li>
        </ul>
      </aside>

      <main className="flex-1 p-5 md:p-12 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="animate-modalPop">
            <h1 className="text-3xl font-bold mb-4 text-[#1a202c] tracking-tight">Welcome, Admin {user?.firstName || ''} 👋</h1>
            <p className="text-lg text-[#4a5568] leading-relaxed">This is your admin dashboard where you can manage doctors, users, and appointments.</p>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="animate-modalPop">
            <h2 className="text-3xl font-bold mb-4 text-[#1a202c] tracking-tight">Users & Doctors Accounts</h2>
            {accounts.length === 0 ? <p className="text-[#4a5568]">No accounts found.</p> : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {currentAccounts.map((account) => (
                    <div key={account._id} className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(79,173,173,0.15)] flex flex-col">
                      <h3 className="text-xl font-bold text-[#2d3748] mb-2">{account.firstName} {account.lastName}</h3>
                      <p className="text-[#718096] text-sm mb-1"><strong>Username:</strong> {account.username}</p>
                      <p className="text-[#718096] text-sm mb-1"><strong>Email:</strong> {account.email}</p>
                      <p className="text-[#718096] text-sm mb-4"><strong>Role:</strong> <span className={`font-bold ${account.role === 'Doctor' ? 'text-[#4fadad]' : 'text-[#333]'}`}>{account.role}</span></p>
                      <button 
                        onClick={() => handleDeleteAccount(account._id)} 
                        disabled={actionLoading}
                        className="mt-auto py-2 px-4 bg-gradient-to-br from-[#f56565] to-[#e53e3e] text-white font-semibold rounded-xl shadow-md transition-all duration-500 hover:scale-110 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🗑️ Delete Account
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center mt-8 gap-4">
                  <button onClick={() => setCurrentAccountPage(prev => Math.max(prev - 1, 1))} disabled={currentAccountPage === 1} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed">⬅ Previous</button>
                  <span className="font-bold text-[#2d3748]">Page {currentAccountPage}</span>
                  <button onClick={() => setCurrentAccountPage(prev => indexOfLastAccount < accounts.length ? prev + 1 : prev)} disabled={indexOfLastAccount >= accounts.length} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed">Next ➡</button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="animate-modalPop">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-3xl font-bold text-[#1a202c] tracking-tight">Appointment History</h2>
              <button 
                onClick={handleDeleteAllAppointments} 
                disabled={actionLoading || appointments.length === 0}
                className="py-2 px-4 bg-gradient-to-br from-[#f56565] to-[#e53e3e] text-white font-bold rounded-xl shadow-md transition-all duration-500 hover:scale-110 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⚠️ Clear All History
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center mb-8 bg-white/60 p-4 rounded-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
              <input type="date" value={appointmentsFilterDate} onChange={handleFilterDate} className="py-2 px-4 rounded-xl border border-[#cbd5e0] focus:border-[#4fadad] focus:ring-4 focus:ring-[#4fadad]/20 outline-none transition-all duration-300 bg-white" />
              <button onClick={handleShowAll} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 hover:shadow-lg">Show All</button>
            </div>

            {filteredAppointments.length === 0 ? <p className="text-[#4a5568]">No appointments history found.</p> : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentAppointments.map((appointment) => {
                    let statusColor = 'bg-[#feebc8] text-[#7b341e]';
                    if(appointment.status === 'Confirmed') statusColor = 'bg-[#c6f6d5] text-[#22543d]';
                    if(appointment.status === 'Rejected') statusColor = 'bg-[#fed7d7] text-[#822727]';

                    return (
                      <div key={appointment._id} className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 flex flex-col items-center sm:items-start sm:flex-row gap-5 transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(79,173,173,0.15)]">
                        <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" alt="Doctor" className="w-[70px] h-[70px] rounded-full object-cover shadow-[0_4px_10px_rgba(0,0,0,0.1)]" />
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-xl font-bold text-[#2d3748] mb-1">Patient: {appointment.patientFirstName} {appointment.patientLastName}</h3>
                          <p className="text-[#718096] text-sm my-1"><strong>Doctor:</strong> Dr. {appointment.doctorFirstName} {appointment.doctorLastName}</p>
                          <p className="text-[#718096] text-sm my-1"><strong>Specialization:</strong> {appointment.doctorSpecialization}</p>
                          <p className="text-[#718096] text-sm my-1"><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>{appointment.status}</div>
                          
                          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                            {appointment.status === 'Pending' && (
                              <>
                                <button onClick={() => handleStatusUpdate(appointment._id, 'Confirmed')} disabled={loadingStatus[appointment._id + 'Confirmed']} className="py-1.5 px-3 bg-gradient-to-br from-[#48bb78] to-[#38a169] text-white font-semibold rounded-lg shadow-sm transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[80px]">
                                  {loadingStatus[appointment._id + 'Confirmed'] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm'}
                                </button>
                                <button onClick={() => handleStatusUpdate(appointment._id, 'Rejected')} disabled={loadingStatus[appointment._id + 'Rejected']} className="py-1.5 px-3 bg-gradient-to-br from-[#f56565] to-[#e53e3e] text-white font-semibold rounded-lg shadow-sm transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[80px]">
                                  {loadingStatus[appointment._id + 'Rejected'] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Reject'}
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleDeleteAppointment(appointment._id)} 
                              disabled={actionLoading}
                              className="py-1.5 px-3 bg-gradient-to-br from-[#f56565] to-[#e53e3e] text-white font-semibold rounded-lg shadow-sm transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center items-center mt-8 gap-4">
                  <button onClick={() => setCurrentApptPage(prev => Math.max(prev - 1, 1))} disabled={currentApptPage === 1} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed">⬅ Previous</button>
                  <span className="font-bold text-[#2d3748]">Page {currentApptPage}</span>
                  <button onClick={() => setCurrentApptPage(prev => indexOfLastAppt < filteredAppointments.length ? prev + 1 : prev)} disabled={indexOfLastAppt >= filteredAppointments.length} className="py-2 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed">Next ➡</button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'createDoctor' && (
          <div className="animate-modalPop max-w-2xl">
            <h2 className="text-3xl font-bold mb-4 text-[#1a202c] tracking-tight">Create Doctor Account</h2>
            <div className="bg-white/80 backdrop-blur-md rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6">
              <DoctorRegistration role="Doctor" />
            </div>
          </div>
        )}
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <div className="bg-white/95 p-10 rounded-[24px] text-center w-[350px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 animate-modalPop">
            <h3 className="text-xl font-bold text-[#1a202c] mb-6">Are you sure you want to logout?</h3>
            <div className="flex justify-around gap-4">
              <button onClick={handleLogout} disabled={loggingOut} className="flex-1 py-3 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100">
                {loggingOut ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></div> : 'Yes'}
              </button>
              <button onClick={() => setShowLogoutModal(false)} disabled={loggingOut} className="flex-1 py-3 px-4 bg-gradient-to-br from-[#f56565] to-[#e53e3e] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100">No</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Modals */}
      {deleteAccountId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <div className="bg-white/95 p-10 rounded-[24px] text-center w-[350px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 animate-modalPop">
            <h3 className="text-xl font-bold text-[#1a202c] mb-6">Are you sure you want to delete this account?</h3>
            <p className="text-sm text-red-500 mb-6 font-semibold">This will delete all related data!</p>
            <div className="flex justify-around gap-4">
              <button onClick={confirmDeleteAccount} disabled={actionLoading} className="flex-1 py-3 px-4 bg-gradient-to-br from-[#e53e3e] to-[#c53030] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100">
                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteAccountId(null)} disabled={actionLoading} className="flex-1 py-3 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteApptId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <div className="bg-white/95 p-10 rounded-[24px] text-center w-[350px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 animate-modalPop">
            <h3 className="text-xl font-bold text-[#1a202c] mb-6">Are you sure you want to delete this appointment?</h3>
            <div className="flex justify-around gap-4">
              <button onClick={confirmDeleteAppointment} disabled={actionLoading} className="flex-1 py-3 px-4 bg-gradient-to-br from-[#e53e3e] to-[#c53030] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100">
                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteApptId(null)} disabled={actionLoading} className="flex-1 py-3 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteAllAppts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <div className="bg-white/95 p-10 rounded-[24px] text-center w-[350px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 animate-modalPop">
            <h3 className="text-xl font-bold text-[#1a202c] mb-6">Delete ALL Appointment History?</h3>
            <p className="text-sm text-red-500 mb-6 font-semibold">This action cannot be undone!</p>
            <div className="flex justify-around gap-4">
              <button onClick={confirmDeleteAllAppointments} disabled={actionLoading} className="flex-1 py-3 px-4 bg-gradient-to-br from-[#e53e3e] to-[#c53030] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100">
                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Yes, Delete All'}
              </button>
              <button onClick={() => setDeleteAllAppts(false)} disabled={actionLoading} className="flex-1 py-3 px-4 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-semibold rounded-xl transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
