import React, { useState } from "react";
import Popup from "./Popup"; 
import "./PatientLogin.css"; 

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);

  const showPopup = (popupObj) => {
    setPopup(popupObj);
    setTimeout(() => setPopup(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
   
    //backend logic here to send reset link
  };

  return (
    <div className="patient-login-container">
      <h2 className="patient-login-title">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          className="patient-login-input"
        />
        <button type="submit" className="patient-login-button" disabled={loading}>
          {loading ? (
            <>
              Sending...
              <span className="spinner"></span>
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <a href="/patient" className="patient-login-link">← Back to Login</a>


      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
    </div>
  );
}
