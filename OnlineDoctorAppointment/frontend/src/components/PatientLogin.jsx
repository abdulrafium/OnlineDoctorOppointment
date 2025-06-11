import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Popup from './Popup';
import './PatientLogin.css';

export function PatientLogin({ role }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [popup, setPopup] = React.useState(null);

  const navigate = useNavigate();

  const showPopup = (popupObj) => {
    setPopup(popupObj);
    setTimeout(() => {
      setPopup(null);
      // if (popupObj.type === 'success') {
      //   navigate('/PatientDashboard');
      // }
    }, 3000);
  };

  

  return (
    <div className="patient-login-container">
      <h2 className="patient-login-title">{role} Login/Register</h2>

      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
        className="patient-login-input"
      /><br />

      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
        className="patient-login-input"
      /><br />

      <button onClick={handleLogin} className="patient-login-button">Login</button>

      <p>Don't have an account? <Link to="/registration" style={{ color: "#4fadad" }}>Create</Link></p>
      <Link to="/" className="patient-login-link">Back to Role Selection</Link>

      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
    </div>
  );
}
