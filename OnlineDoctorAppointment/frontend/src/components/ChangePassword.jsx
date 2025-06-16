import React, { useState, useEffect } from 'react';
import './ChangePassword.css';
import Popup from './Popup'; // ✅ Ensure this is correctly imported

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); // 🔄 Spinner state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setType('error');
      setMessage('New and confirm password do not match');
      setShowPopup(true);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setType('error');
      setMessage('New password must be different from current password');
      setShowPopup(true);
      return;
    }

    setLoading(true); // 🟡 Start loading

    //Backend API call to change password

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <div className="change-password-container">
      <h2>🔐 Change Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              Updating...
              <span className="spinner"></span>
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </form>

      {showPopup && (
        <Popup
          message={message}
          type={type}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default ChangePassword;
