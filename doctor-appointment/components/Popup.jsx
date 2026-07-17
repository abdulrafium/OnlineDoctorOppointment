'use client';
import React from 'react';
import '../styles/Popup.css';

export default function Popup({ message, type, onClose }) {
  return (
    <div className={`popup ${type}`}>
      <p>{message}</p>
      <button onClick={onClose}>✖</button>
    </div>
  );
}
