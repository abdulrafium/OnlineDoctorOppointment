import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Popup from './Popup'; // Adjust the path as needed
import './Registration.css';

export function Registration({ role }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [popup, setPopup] = useState(null); // For animated popup

   

    // Helper function to show popup and auto-close it after 3 seconds
    const showPopup = (popupObj) => {
        setPopup(popupObj);
        setTimeout(() => {
            setPopup(null);
        }, 3000); // 3000ms = 3 seconds
    };

    
    return (
        <div className="registration-container">
            <h2 className="registration-title">Patient {role}</h2>

            <input
                type="text"
                value={firstName}
                placeholder="First Name *"
                onChange={e => setFirstName(e.target.value)}
                className="registration-input"
            /><br />
            <input
                type="text"
                value={lastName}
                placeholder="Last Name *"
                onChange={e => setLastName(e.target.value)}
                className="registration-input"
            /><br />
            <input
                type="text"
                value={username}
                placeholder="Username (auto-generated)"
                readOnly
                className="registration-input registration-input-readonly"
            /><br />
            <input
                type="email"
                value={email}
                placeholder="Email *"
                onChange={e => setEmail(e.target.value)}
                className="registration-input"
            /><br />
            <input
                type="password"
                value={password}
                placeholder="Password *"
                onChange={e => setPassword(e.target.value)}
                className="registration-input"
            /><br />
            <input
                type="password"
                value={confirmPassword}
                placeholder="Confirm Password *"
                onChange={e => setConfirmPassword(e.target.value)}
                className="registration-input"
            /><br />

            <button onClick={handleRegister} className="registration-button">Register</button><br /><br />

            <Link to="/patient" className="registration-link">Login</Link>
            <Link to="/" className="registration-back-link">Back to Role Selection</Link>

            {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
        </div>
    );
}
