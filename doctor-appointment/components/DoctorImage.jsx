'use client';
import React from 'react';
import Image from 'next/image';
import '../styles/DoctorImage.css';

const DoctorImage = () => {
  return (
    <div className="doctor-picture-container">
      <img
        src="/doctor-image2.png"
        alt="Healthcare professionals"
        className="doctor-picture"
      />
    </div>
  );
};

export default DoctorImage;
