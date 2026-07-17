'use client';
import React, { useEffect, useState } from 'react';
import Popup from './Popup';

export function DoctorRegistration({ role }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (firstName && lastName) setUsername((firstName + lastName).toLowerCase().replace(/\s+/g, ''));
    else setUsername('');
  }, [firstName, lastName]);

  const showPopup = (popupObj) => { setPopup(popupObj); setTimeout(() => setPopup(null), 3000); };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) return showPopup({ message: 'Please fill in all required fields.', type: 'error' });
    const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i;
    if (!emailRegex.test(email)) return showPopup({ message: 'Email must be a valid domain like @gmail.com', type: 'error' });
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) return showPopup({ message: 'Password must be 8+ chars with uppercase, number & special symbol.', type: 'error' });
    if (password !== confirmPassword) return showPopup({ message: 'Passwords do not match.', type: 'error' });
    setLoading(true);
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, username, email, password, role }) });
      const data = await res.json();
      if (res.ok) {
        showPopup({ message: data.msg, type: 'success' });
        setFirstName(''); setLastName(''); setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
      } else {
        showPopup({ message: data.msg, type: 'error' });
      }
    } catch (err) {
      showPopup({ message: 'Registration failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full py-2 px-4 rounded-xl border border-[#cbd5e0] focus:border-[#4fadad] focus:ring-4 focus:ring-[#4fadad]/20 outline-none transition-all duration-300 bg-white/60 text-[#2d3748] placeholder-[#a0aec0]";

  return (
    <div className="w-full">
      <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" value={firstName} placeholder="First Name *" onChange={e => setFirstName(e.target.value)} className={inputClass} />
        <input type="text" value={lastName} placeholder="Last Name *" onChange={e => setLastName(e.target.value)} className={inputClass} />
        <input type="text" value={username} placeholder="Username (auto-generated)" readOnly className={`${inputClass} bg-[#e2e8f0] cursor-not-allowed`} />
        <input type="email" value={email} placeholder="Active Email *" onChange={e => setEmail(e.target.value)} className={inputClass} />
        <input type="password" value={password} placeholder="Password *" onChange={e => setPassword(e.target.value)} className={inputClass} />
        <input type="password" value={confirmPassword} placeholder="Confirm Password *" onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
        
        <button type="submit" className="md:col-span-2 mt-2 py-2.5 px-6 bg-gradient-to-br from-[#4fadad] to-[#2c7a7b] text-white font-bold rounded-xl shadow-md transition-all duration-500 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 flex items-center justify-center" disabled={loading}>
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Create Doctor Account'}
        </button>
      </form>
      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
    </div>
  );
}
