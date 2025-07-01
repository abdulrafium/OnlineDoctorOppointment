import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Popup from './Popup';
import './PatientLogin.css';

export function PatientLogin({ role }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [popup, setPopup] = React.useState(null);
  const [loading, setLoading] = React.useState(false); // Spinner state

  const navigate = useNavigate();

  const showPopup = (popupObj) => {
    setPopup(popupObj);
    setTimeout(() => setPopup(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
    const emailDomain = email.split("@")[1];

    if (!email || !email.includes("@") || !allowedDomains.includes(emailDomain)) {
      return showPopup({ message: "Please enter a valid email with a supported domain.", type: "error" });
    }

    setLoading(true); // Start spinner

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        showPopup({ message: data.msg || "Login successful", type: "success" });

        setTimeout(() => {
          if (data.role === "Patient") {
            navigate("/patientdashboard");
          }
        }, 1000);
      } else {
        showPopup({ message: data.msg || "Login failed", type: "error" });
      }
    } catch (err) {
      showPopup({ message: "Login failed. Server error.", type: "error" });
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  return (
    <div className="patient-login-container">
      <h2 className="patient-login-title">{role} Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          className="patient-login-input"
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          className="patient-login-input"
        />

        <p>
          <Link to="/forgot-password" style={{ color: "#4fadad" }}>
            Forgot Password?
          </Link>
        </p>

        <button type="submit" className="patient-login-button" disabled={loading}>
          {loading ? (
            <>
              Logging in...
              <span className="spinner"></span>
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <p>Don't have an account? <Link to="/registration" style={{ color: "#4fadad" }}>Create</Link></p>
      <Link to="/" className="patient-login-link">Back to Role Selection</Link>

      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
    </div>
  );
}
