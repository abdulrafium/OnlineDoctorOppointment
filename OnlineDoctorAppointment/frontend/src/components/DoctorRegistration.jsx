import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Popup from './Popup';
import './Registration.css';

export function DoctorRegistration({ role }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false); // 🔄 Spinner state

  useEffect(() => {
    if (firstName && lastName) {
      setUsername((firstName + lastName).toLowerCase().replace(/\s+/g, ''));
    } else {
      setUsername('');
    }
  }, [firstName, lastName]);

  const showPopup = (popupObj) => {
    setPopup(popupObj);
    setTimeout(() => {
      setPopup(null);
    }, 3000);
  };

  //Backend Doctor Regitration

  return (
    <div className="registration-container">
      <h2 className="registration-title">{role} Registration</h2>

      <form onSubmit={handleRegister}>
        <input type="text" value={firstName} placeholder="First Name *" onChange={e => setFirstName(e.target.value)} className="registration-input" />
        <input type="text" value={lastName} placeholder="Last Name *" onChange={e => setLastName(e.target.value)} className="registration-input" />
        <input type="text" value={username} placeholder="Username (auto-generated)" readOnly className="registration-input registration-input-readonly" />
        <input type="email" value={email} placeholder="Email *" onChange={e => setEmail(e.target.value)} className="registration-input" />
        <input type="password" value={password} placeholder="Password *" onChange={e => setPassword(e.target.value)} className="registration-input" />
        <input type="password" value={confirmPassword} placeholder="Confirm Password *" onChange={e => setConfirmPassword(e.target.value)} className="registration-input" />

        <button type="submit" className="registration-button" disabled={loading}>
          {loading ? (
            <>
              Registering...
              <span className="spinner"></span>
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
    </div>
  );
}
