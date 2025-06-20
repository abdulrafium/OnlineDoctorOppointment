const express = require("express");
const router = express.Router();
const DoctorProfile = require("../models/DoctorDetails");
const User = require("../models/Users");

// 🔸 POST: Save or Update Doctor Details (Partial Update Allowed)
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
    availableTime
  } = req.body;

  if (!userId) {
    return res.status(400).json({ msg: "User ID is required" });
  }

  try {
    const existingProfile = await DoctorProfile.findOne({ userId });

    // If updating existing profile, only update provided fields
    if (existingProfile) {
      const updateFields = {};

      if (cnic) updateFields.cnic = cnic;
      if (gender) updateFields.gender = gender;
      if (specialization) updateFields.specialization = specialization;
      if (city) updateFields.city = city;
      if (hospital) updateFields.hospital = hospital;
      if (experience) updateFields.experience = experience;
      if (fee) updateFields.fee = fee;
      if (description) updateFields.description = description;
      if (availableTime) updateFields.availableTime = availableTime;

      await DoctorProfile.updateOne({ userId }, { $set: updateFields });

      return res.status(200).json({ success: true, updated: true, msg: "Doctor profile updated successfully" });
    }

    // 🔒 New profile: All required fields must be present
    if (
      !cnic || !gender || !specialization ||
      !city || !hospital || !experience || !fee || !description
    ) {
      return res.status(400).json({ msg: "All fields are required for new profile" });
    }

    // Check CNIC used by another doctor
    const cnicExists = await DoctorProfile.findOne({ cnic, userId: { $ne: userId } });
    if (cnicExists) {
      return res.status(409).json({ msg: "CNIC already exists for another user" });
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
      availableTime: availableTime || ""
    });

    await newProfile.save();

    res.status(200).json({ success: true, updated: false, msg: "Doctor profile created successfully" });

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
    console.error("❌ Error fetching doctor profile:", err);
    res.status(500).json({ success: false, msg: "Error fetching doctor profile", error: err.message });
  }
});

// 🔹 GET: List all doctors with user info (for patients)
router.get("/get-doctors", async (req, res) => {
  try {
    const doctors = await User.find({ role: "Doctor" });
    const doctorProfiles = await DoctorProfile.find();

    const mergedDoctors = doctors.map(doc => {
      const profile = doctorProfiles.find(
        d => d.userId.toString() === doc._id.toString()
      ) || {};

      return {
        _id: doc._id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        specialization: profile.specialization || '',
        city: profile.city || '',
        hospital: profile.hospital || '',
        experience: profile.experience || '',
        fee: profile.fee || '',
        description: profile.description || '',
        availableTime: profile.availableTime || ''
      };
    });

    res.status(200).json({ success: true, doctors: mergedDoctors });
  } catch (err) {
    console.error("❌ Error fetching doctors list:", err);
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
  }
});

module.exports = router;
