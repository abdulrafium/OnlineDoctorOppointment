const mongoose = require("mongoose");

const patientDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cnic: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  fatherName: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("PatientDetails", patientDetailsSchema);
