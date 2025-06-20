const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");
const User = require("../models/Users");
const PatientDetails = require("../models/PatientDetails");
const DoctorDetails = require("../models/DoctorDetails");

// 📌 Book an appointment
router.post("/book-appointment", async (req, res) => {
  const { patientUserId, doctorUserId, appointmentDate } = req.body;

  try {
    const existing = await Appointment.findOne({
      patientUserId,
      doctorUserId,
      date: new Date(appointmentDate),
      status: { $ne: "Cancelled" },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        msg: "You already have an appointment with this doctor.",
      });
    }

    const patientUser = await User.findById(patientUserId);
    const patientDetail = await PatientDetails.findOne({ userId: patientUserId });

    const doctorUser = await User.findById(doctorUserId);
    const doctorDetail = await DoctorDetails.findOne({ userId: doctorUserId });

    if (!patientUser || !patientDetail || !doctorUser || !doctorDetail) {
      return res.status(400).json({
        success: false,
        msg: "❌ Missing user or detail record. Please complete your profile.",
      });
    }

    const newAppointment = new Appointment({
      patientUserId,
      patientFirstName: patientUser.firstName,
      patientLastName: patientUser.lastName,
      patientFatherName: patientDetail.fatherName,
      patientGender: patientDetail.gender,
      patientMobile: patientDetail.mobile,
      patientCity: patientDetail.city,
      patientAddress: patientDetail.address,

      doctorUserId,
      doctorFirstName: doctorUser.firstName,
      doctorLastName: doctorUser.lastName,
      doctorSpecialization: doctorDetail.specialization,
      doctorGender: doctorDetail.gender,
      doctorCity: doctorDetail.city,
      doctorHospital: doctorDetail.hospital,
      date: appointmentDate,

      status: "Pending",
    });

    await newAppointment.save();

    return res.status(200).json({
      success: true,
      msg: "✅ Appointment booked successfully!",
    });

  } catch (err) {
    console.error("❌ Error booking appointment:", err);
    return res.status(500).json({
      success: false,
      msg: "❌ Server error occurred. Please try again.",
      error: err.message,
    });
  }
});

// 📌 Get appointments by patient user ID
router.post("/get-appointments", async (req, res) => {
  const { patientUserId } = req.body;

  try {
    const appointments = await Appointment.find({ patientUserId });
    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    return res.status(500).json({
      success: false,
      msg: "❌ Failed to fetch appointments.",
    });
  }
});

// 📌 Get all appointments (Admin)
router.get("/get-all-appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: -1 });
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No appointments found.",
      });
    }

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (err) {
    console.error("❌ Error fetching all appointments:", err);
    return res.status(500).json({
      success: false,
      msg: "❌ Server error while fetching appointments.",
    });
  }
});

// 📌 Update appointment status
router.post("/update-appointment-status", async (req, res) => {
  const { _id, status } = req.body;

  try {
    const updated = await Appointment.findByIdAndUpdate(
      _id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, msg: "Appointment not found" });
    }

    return res.status(200).json({ success: true, msg: "Status updated", updated });
  } catch (err) {
    console.error("❌ Error updating appointment status:", err);
    return res.status(500).json({
      success: false,
      msg: "❌ Server error while updating status.",
    });
  }
});

// 📌 Get confirmed patients for a particular doctor
router.get("/doctor-confirmed-patients/:doctorUserId", async (req, res) => {
  const { doctorUserId } = req.params;

  try {
    const confirmedAppointments = await Appointment.find({
      doctorUserId,
      status: "Confirmed"
    }).sort({ date: -1 });

    if (!confirmedAppointments || confirmedAppointments.length === 0) {
      return res.status(200).json({
        success: true,
        patients: [],
        msg: "No confirmed patients found for this doctor.",
      });
    }

    const patients = confirmedAppointments.map((appt) => ({
      name: `${appt.patientFirstName} ${appt.patientLastName}`,
      mobile: appt.patientMobile,
      gender: appt.patientGender,
      city: appt.patientCity,
      address: appt.patientAddress,
      appointmentDate: appt.date,
    }));

    return res.status(200).json({
      success: true,
      patients,
    });

  } catch (err) {
    console.error("❌ Error fetching confirmed patients:", err);
    return res.status(500).json({
      success: false,
      msg: "❌ Failed to fetch confirmed patients.",
      error: err.message
    });
  }
});

// ✅ 📌 Get all appointments for a doctor (with fee info)
router.get("/doctor-appointments/:doctorUserId", async (req, res) => {
  const { doctorUserId } = req.params;

  try {
    const appointments = await Appointment.find({ doctorUserId }).sort({ date: -1 });
    const doctorDetail = await DoctorDetails.findOne({ userId: doctorUserId });

    return res.status(200).json({
      success: true,
      appointments,
      fee: doctorDetail?.fee || null
    });
  } catch (err) {
    console.error("❌ Error fetching doctor appointments:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching doctor appointments."
    });
  }
});

module.exports = router;
