import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Popup from './Popup';
import './Login.css';

export function Login({ role }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [popup, setPopup] = React.useState(null);
  const [loading, setLoading] = React.useState(false); // Spinner state
  const navigate = useNavigate();

  const showPopup = (popupObj) => {
    setPopup(popupObj);
    setTimeout(() => {
      setPopup(null);
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
    const emailDomain = email.split("@")[1];

    if (!email || !email.includes("@") || !allowedDomains.includes(emailDomain)) {
      return showPopup({ message: "Please enter a valid email with a supported domain.", type: "error" });
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();

      if (res.ok && data.token && data.user && data.role) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userData", JSON.stringify({ user: data.user }));

        showPopup({ message: data.msg || "Login successful.", type: "success" });

        setTimeout(() => {
          if (data.role === "Doctor") {
            navigate("/doctordashboard");
          } else if (data.role === "Admin") {
            navigate("/admindashboard");
          } else {
            showPopup({ message: "Invalid role!", type: "error" });
          }
        }, 1000);
      } else {
        showPopup({ message: data.msg || "Login failed.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      showPopup({ message: "Login failed. Server error.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">{role} Login</h2>

      <form onSubmit={handleLogin}>
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
        <button type="submit" className="login-button" disabled={loading}>
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

      <Link to="/" className="back-link">Back to Role Selection</Link>

      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
    </div>
  );
}
