'use client';
import React, { useState, useEffect } from 'react';
import Popup from './Popup';
import '../styles/PatientProfile.css';

const PatientProfile = () => {
  const [formData, setFormData] = useState({ cnic: '', mobile: '', gender: '', fatherName: '', city: '', address: '' });
  const [userId, setUserId] = useState(null);
  const [popup, setPopup] = useState({ visible: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cnic' && !/^\d{0,13}$/.test(value)) return;
    if (name === 'mobile' && !/^\d{0,11}$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const userRes = await fetch('/api/get-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const userData = await userRes.json();
        if (userData.success) {
          const id = userData.user._id;
          setUserId(id);
          const detailsRes = await fetch(`/api/get-details/${id}`);
          const detailsData = await detailsRes.json();
          if (detailsData.success && detailsData.details) setFormData(detailsData.details);
        } else {
          showPopup('User authentication failed', 'error');
        }
      } catch (error) {
        showPopup('Server error while loading profile.', 'error');
      }
    };
    fetchUserAndDetails();
  }, []);

  const showPopup = (message, type) => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ visible: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{13}$/.test(formData.cnic)) { showPopup('CNIC must be exactly 13 digits', 'error'); return; }
    if (!/^\d{11}$/.test(formData.mobile)) { showPopup('Mobile number must be exactly 11 digits', 'error'); return; }
    try {
      setLoading(true);
      const res = await fetch('/api/save-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId }),
      });
      const data = await res.json();
      if (data.msg === 'Details saved successfully' || data.msg === 'Details updated successfully') {
        showPopup(data.msg, 'success');
        setFormData({ cnic: '', mobile: '', gender: '', fatherName: '', city: '', address: '' });
      } else {
        showPopup(data.msg, 'error');
      }
    } catch (err) {
      showPopup('Server error while saving profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-profile-container">
      <h2 className="patient-profile-title">📝 Patient Profile</h2>
      <form className="patient-profile-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input className="form-input" name="cnic" placeholder="CNIC (13 digits)" value={formData.cnic} onChange={handleChange} required />
          <input className="form-input" name="mobile" placeholder="Mobile (11 digits)" value={formData.mobile} onChange={handleChange} required />
          <select className="form-input" name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-row">
          <input className="form-input" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleChange} required />
          <select className="form-input" name="city" value={formData.city} onChange={handleChange} required>
            <option value="">City</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Quetta">Quetta</option>
            <option value="Sukkur">Sukkur</option>
            <option value="Khairpur">Khairpur</option>
          </select>
          <div style={{ flex: 1 }} />
        </div>
        <textarea className="form-input" name="address" placeholder="Address" value={formData.address} onChange={handleChange} rows={4} style={{ resize: 'none' }} required></textarea>
        <button type="submit" className="patient-profile-button" disabled={loading}>
          {loading ? <><span className="spinner"></span>Saving...</> : '💾 Save Patient Details'}
        </button>
      </form>
      {popup.visible && <Popup message={popup.message} type={popup.type} />}
    </div>
  );
};

export default PatientProfile;
