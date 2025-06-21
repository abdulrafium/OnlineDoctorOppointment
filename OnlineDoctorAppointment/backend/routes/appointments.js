const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");
const User = require("../models/Users");
const PatientDetails = require("../models/PatientDetails");
const DoctorDetails = require("../models/DoctorDetails");

// Book an appointment
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
        msg: "Missing user or detail record. Please complete your profile.",
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
      patientEmail: patientUser.email,

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
      msg: "Appointment booked successfully!",
    });

  } catch (err) {
    console.error("Error booking appointment:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error occurred. Please try again.",
      error: err.message,
    });
  }
});

// Get appointments by patient user ID
router.post("/get-appointments", async (req, res) => {
  const { patientUserId } = req.body;

  try {
    const appointments = await Appointment.find({ patientUserId });
    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch appointments.",
    });
  }
});

// Get all appointments (Admin)
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
    console.error("Error fetching all appointments:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching appointments.",
    });
  }
});

// Update appointment status
// router.post("/update-appointment-status", async (req, res) => {
//   const { _id, status } = req.body;

//   try {
//     const updated = await Appointment.findByIdAndUpdate(
//       _id,
//       { status },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ success: false, msg: "Appointment not found" });
//     }

//     return res.status(200).json({ success: true, msg: "Status updated", updated });
//   } catch (err) {
//     console.error("Error updating appointment status:", err);
//     return res.status(500).json({
//       success: false,
//       msg: "Server error while updating status.",
//     });
//   }
// });

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
   user: process.env.EMAIL,
  pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, message) => {
  await transporter.sendMail({
    from: '"Doctor Appointment System" <your_email@gmail.com>',
    to,
    subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4fadad; text-align: center;">Doctor Appointment Notification</h2>
          <p style="font-size: 16px; color: #333;">${message}</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #999;">If you have any questions, please contact support.</p>
          <p style="font-size: 14px; color: #999;">&copy; ${new Date().getFullYear()} Online Doctor Appointment System</p>
        </div>
      </div>
    `,
  });
};

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

    // Fetch actual doctor details to get availableTime
    const doctorDetail = await DoctorDetails.findOne({ userId: updated.doctorUserId });

    // Convert availableTime (e.g., "17:00" or "5:00 PM") to 12-hour format
    let formattedDoctorTime = "N/A";
    if (doctorDetail?.availableTime) {
      const [hour, minute] = doctorDetail.availableTime.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hour));
      timeDate.setMinutes(parseInt(minute));
      formattedDoctorTime = timeDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Format appointment date
    const appointmentDate = new Date(updated.date);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject =
      status === "Confirmed"
        ? "Your appointment has been confirmed"
        : "Your appointment has been rejected";

    const message =
      status === "Confirmed"
        ? `Dear <strong>${updated.patientFirstName} ${updated.patientLastName}</strong>, your appointment with 
           <strong>Dr. ${updated.doctorFirstName} ${updated.doctorLastName}</strong> has been 
           <span style="color: green; font-weight: bold;">confirmed</span>.<br/><br/>
           📅 <strong>Date:</strong> ${formattedDate}<br/>
           🕒 <strong>Time:</strong> ${formattedDoctorTime}<br/>
           🏥 <strong>Hospital:</strong> ${updated.doctorHospital}<br/>
           🏙️ <strong>City:</strong> ${updated.doctorCity}<br/><br/>
           Please be on time. Thank you for using our service.`
        : `Dear <strong>${updated.patientFirstName} ${updated.patientLastName}</strong>, we regret to inform you that your appointment with 
           <strong>Dr. ${updated.doctorFirstName} ${updated.doctorLastName}</strong> on <strong>${formattedDate}</strong> 
           has been <span style="color: red; font-weight: bold;">rejected</span>.<br/><br/>
           🏥 <strong>Hospital:</strong> ${updated.doctorHospital}<br/>
           🏙️ <strong>City:</strong> ${updated.doctorCity}<br/><br/>
           You may try booking a new appointment.`;

    await sendEmail(updated.patientEmail, subject, message);

    return res.status(200).json({ success: true, msg: "Status updated and email sent", updated });
  } catch (err) {
    console.error("Error updating appointment status:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while updating status.",
    });
  }
});



// Get confirmed patients for a particular doctor
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
    console.error("Error fetching confirmed patients:", err);
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch confirmed patients.",
      error: err.message
    });
  }
});

// Get all appointments for a doctor (with fee info)
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
    console.error("Error fetching doctor appointments:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching doctor appointments."
    });
  }
});

module.exports = router;
