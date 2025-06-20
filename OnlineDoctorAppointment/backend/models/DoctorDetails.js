const mongoose = require("mongoose");

const doctorDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  cnic: {
    type: String,
    required: true,
    length: 13,
    unique: true
  },
  gender: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  fee: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  availableTime: {
    type: String, // e.g. "14:30"
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("DoctorDetails", doctorDetailsSchema);
