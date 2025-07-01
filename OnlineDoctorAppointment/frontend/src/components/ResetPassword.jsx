import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Popup from "./Popup";
import "./PatientLogin.css";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleToggle = () => setShowPassword(!showPassword);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!passwordRegex.test(password)) {
      setMessage("Password must be 8+ chars with uppercase, number & symbol.");
      setType("error");
      setShowPopup(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setType("error");
      setShowPopup(true);
      return;
    }

    setLoading(true);

    //Backend logic to reset password
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <div className="patient-login-container">
      <h2 className="patient-login-title">🔐 Reset Password</h2>
      <form onSubmit={handleReset}>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
          className="patient-login-input"
        />
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="patient-login-input"
        />

        <label style={{ display: "block", fontSize: "14px", marginBottom: "15px" }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={handleToggle}
            style={{ marginRight: "8px" }}
          />
          Show Password
        </label>

        <button type="submit" className="patient-login-button" disabled={loading}>
          {loading ? (
            <>
              Resetting...
              <span className="spinner"></span>
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <a href="/patient" className="patient-login-link">← Back to Login</a>

      {showPopup && (
        <Popup
          message={message}
          type={type}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
