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

  
   const handleRegister = async (e) => {
  e.preventDefault();

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return showPopup({ message: "Please fill in all required fields.", type: "error" });
  }

  const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i;
  if (!emailRegex.test(email)) {
    return showPopup({ message: "Email must be a valid domain like @gmail.com", type: "error" });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return showPopup({
      message: "Password must be 8+ chars with uppercase, number & special symbol.",
      type: "error"
    });
  }

  if (password !== confirmPassword) {
    return showPopup({ message: "Passwords do not match.", type: "error" });
  }

    setLoading(true); // 🟡 Start spinner

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, username, email, password, role })
      });

      const data = await res.json();

      if (res.ok) {
        showPopup({ message: data.msg, type: "success" });
        setFirstName('');
        setLastName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        showPopup({ message: data.msg, type: "error" });
      }
    } catch (err) {
      showPopup({ message: "Registration failed.", type: "error" });
    } finally {
      setLoading(false); // 🔴 Stop spinner
    }
  };

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
