const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientUserId: String,
  patientFirstName: String,
  patientLastName: String,
  patientFatherName: String,
  patientGender: String,
  patientMobile: String,
  patientCity: String,
  patientAddress: String,

  doctorUserId: String,
  doctorFirstName: String,
  doctorLastName: String,
  doctorSpecialization: String,
  doctorGender: String,
  doctorCity: String,
  doctorHospital: String,

  date: {
    type: String, // or Date if you're sending actual date object
    required: true
  },

  status: {
    type: String,
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
