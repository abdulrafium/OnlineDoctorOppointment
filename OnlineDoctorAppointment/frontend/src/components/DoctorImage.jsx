import React from 'react';
import doctorImage from '../assets/doctor-image2.png';
import './DoctorImage.css';

const DoctorImage = () => {
  return (
    <div className="doctor-picture-container">
      <img 
        src={doctorImage} 
        alt="Healthcare professionals" 
        className="doctor-picture"
      />
    </div>
  );
};

export default DoctorImage;
