import React from 'react';
import { Link } from 'react-router-dom';
import Popup from './Popup'; // Adjust path as needed
import './Login.css';

export function Login({ role }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [popup, setPopup] = React.useState(null); // For animated popup

  const showPopup = (popupObj) => {
    setPopup(popupObj);
    setTimeout(() => {
      setPopup(null);
    }, 3000); // Auto close after 3 seconds
  };

  

  return (
    <div className="login-container">
      <h2 className="login-title">{role} Login</h2>
      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
        className="login-input"
      /><br />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
        className="login-input"
      /><br />
      <button onClick={handleLogin} className="login-button">Login</button>
      <Link to="/" className="back-link">Back to Role Selection</Link>

      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
    </div>
  );
}
