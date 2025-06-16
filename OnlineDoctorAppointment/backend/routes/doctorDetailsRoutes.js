const express = require("express");
const router = express.Router();
const DoctorProfile = require("../models/DoctorDetails");

// 🔸 POST: Save or Update Doctor Details
router.post("/save-doctor-details", async (req, res) => {
  const {
    userId,
    cnic,
    gender,
    specialization,
    city,
    hospital,
    experience,
    fee,
    description,
  } = req.body;

  if (
    !userId || !cnic || !gender || !specialization ||
    !city || !hospital || !experience || !fee || !description
  ) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const existingProfile = await DoctorProfile.findOne({ userId });

    // CNIC already used by another doctor
    const cnicExists = await DoctorProfile.findOne({ cnic, userId: { $ne: userId } });
    if (cnicExists) {
      return res.status(409).json({ msg: "CNIC already exists for another user" });
    }

    if (existingProfile) {
      await DoctorProfile.updateOne(
        { userId },
        { cnic, gender, specialization, city, hospital, experience, fee, description }
      );
      return res.status(200).json({ success: true, updated: true, msg: "Doctor profile updated successfully" });
    }

    const newProfile = new DoctorProfile({
      userId,
      cnic,
      gender,
      specialization,
      city,
      hospital,
      experience,
      fee,
      description,
    });

    await newProfile.save();
    res.status(200).json({ success: true, updated: false, msg: "Doctor profile saved successfully" });

  } catch (err) {
    console.error("❌ Error saving/updating doctor profile:", err);
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
  }
});

// 🔹 GET: Fetch doctor details by userId
router.get("/get-doctor-details/:userId", async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.params.userId });
    if (!profile) {
      return res.status(200).json({ success: true, profile: null });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error("Error fetching doctor profile:", err);
    res.status(500).json({ success: false, msg: "Error fetching doctor profile", error: err.message });
  }
});

module.exports = router;
