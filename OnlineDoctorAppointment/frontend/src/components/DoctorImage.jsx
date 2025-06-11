import React from 'react';
import doctorImage from '../assets/doctor-image2.png';

const DoctorImage = () => {
  return (
    <div>
      <img 
        src={doctorImage} 
        alt="Healthcare professionals" 
        style={{
          width: "80%",
          height: "auto",
          display: "block"
        }} 
      />
    </div>
  );
};

export default DoctorImage;