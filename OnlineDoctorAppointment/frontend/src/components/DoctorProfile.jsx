import React, { useState, useEffect } from 'react';
import Popup from './Popup';
import './PatientProfile.css';

const DoctorProfile = () => {
  const [formData, setFormData] = useState({
    cnic: '',
    gender: '',
    specialization: '',
    city: '',
    hospital: '',
    experience: '',
    fee: '',
    description: '',
  });

  const [userId, setUserId] = useState(null);
  const [popup, setPopup] = useState({ visible: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState('');

  const hospitalsByCity = {
    Karachi: ["Aga Khan University Hospital", "Liaquat National Hospital", "Indus Hospital", "Dow University Hospital", "South City Hospital"],
    Lahore: ["Shaukat Khanum Memorial Hospital", "Punjab Institute of Cardiology", "Jinnah Hospital", "Mayo Hospital"],
    Islamabad: ["PIMS", "Shifa International Hospital", "Polyclinic Hospital"],
    Peshawar: ["Lady Reading Hospital", "Khyber Teaching Hospital"],
    Quetta: ["Civil Hospital", "BMC Hospital"],
    Sukkur: ["Ghulam Muhammad Mahar Medical College Hospital"],
    Khairpur: ["Civil Hospital Khairpur", "Khairpur Medical Center"]
  };

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const userRes = await fetch("http://localhost:5000/api/get-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const userData = await userRes.json();

        if (userData.success) {
          const id = userData.user._id;
          setUserId(id);

          const detailsRes = await fetch(`http://localhost:5000/api/get-doctor-details/${id}`);
          const detailsData = await detailsRes.json();

          if (detailsData.success && detailsData.profile) {
            setFormData(detailsData.profile);
          }
        } else {
          showPopup("User authentication failed", "error");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showPopup("Server error while loading profile.", "error");
      }
    };

    fetchUserAndDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cnic' && !/^\d{0,13}$/.test(value)) return;

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'city' && { hospital: '' }) // reset hospital on city change
    }));
  };

  const showPopup = (message, type) => {
    setPopup({ visible: true, message, type });
    setTimeout(() => {
      setPopup({ visible: false, message: '', type: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{13}$/.test(formData.cnic)) {
      showPopup("CNIC must be exactly 13 digits", "error");
      return;
    }

    if (!userId) {
      showPopup("User ID not found. Please log in again.", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/save-doctor-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.updated) {
          showPopup("Doctor profile updated successfully", "success");
        } else {
          showPopup("Doctor profile saved successfully", "success");
          setFormData({
            cnic: '',
            gender: '',
            specialization: '',
            city: '',
            hospital: '',
            experience: '',
            fee: '',
            description: '',
          });
          setPreviewURL('');
        }
      } else {
        showPopup("Error saving profile", "error");
      }
    } catch (err) {
      console.error("Error submitting:", err);
      showPopup("Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-profile-container">
      <h2 className="patient-profile-title">🩺 Doctor Profile</h2>
      <form className="patient-profile-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input className="form-input" name="cnic" placeholder="CNIC (13 digits)" value={formData.cnic} onChange={handleChange} required />
          <select className="form-input" name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select className="form-input" name="specialization" value={formData.specialization} onChange={handleChange} required>
            <option value="">Specialization</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Orthopedic">Orthopedic</option>
            <option value="Pediatrician">Pediatrician</option>
            <option value="Psychiatrist">Psychiatrist</option>
            <option value="General Physician">General Physician</option>
          </select>
        </div>

        <div className="form-row">
          <select className="form-input" name="city" value={formData.city} onChange={handleChange} required>
            <option value="">Select City</option>
            {Object.keys(hospitalsByCity).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select className="form-input" name="hospital" value={formData.hospital} onChange={handleChange} required>
            <option value="">Select Hospital</option>
            {(hospitalsByCity[formData.city] || []).map(hospital => (
              <option key={hospital} value={hospital}>{hospital}</option>
            ))}
          </select>

          <input className="form-input" name="experience" placeholder="Experience (years)" value={formData.experience} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <input className="form-input" name="fee" placeholder="Consultation Fee (PKR)" value={formData.fee} onChange={handleChange} required />
        </div>

        <textarea
          className="form-input"
          name="description"
          placeholder="Short Description / Bio"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          style={{ resize: 'none' }}
          required
        ></textarea>

        <button type="submit" className="patient-profile-button" disabled={loading}>
          {loading ? "Saving..." : "💾 Save Doctor Profile"}
        </button>
      </form>

      {popup.visible && <Popup message={popup.message} type={popup.type} />}
    </div>
  );
};

export default DoctorProfile;
