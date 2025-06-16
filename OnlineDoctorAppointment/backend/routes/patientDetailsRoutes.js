const express = require("express");
const router = express.Router();
const PatientDetails = require("../models/PatientDetails");

// 🔸 POST: Save or Update Patient Details
router.post("/save-details", async (req, res) => {
  const { userId, cnic, mobile, gender, fatherName, city, address } = req.body;

  if (!userId || !cnic || !mobile || !gender || !fatherName || !city || !address) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // ✅ Check if this user already has details
    const existing = await PatientDetails.findOne({ userId });

    // ✅ If updating existing details
    if (existing) {
      // Check if CNIC or mobile is already used by another user
      const cnicExists = await PatientDetails.findOne({ cnic, userId: { $ne: userId } });
      const mobileExists = await PatientDetails.findOne({ mobile, userId: { $ne: userId } });

      if (cnicExists) {
        return res.status(409).json({ msg: "CNIC already exists for another user" });
      }

      if (mobileExists) {
        return res.status(409).json({ msg: "Mobile number already exists for another user" });
      }

      // Proceed with update
      const updateResult = await PatientDetails.updateOne(
        { userId },
        { cnic, mobile, gender, fatherName, city, address }
      );

      if (updateResult.modifiedCount > 0) {
        return res.status(200).json({ msg: "Details updated successfully" });
      } else {
        return res.status(200).json({ msg: "No changes were made" });
      }
    }

    // ✅ If creating new details
    // Check if CNIC or mobile already exists globally
    const cnicExists = await PatientDetails.findOne({ cnic });
    const mobileExists = await PatientDetails.findOne({ mobile });

    if (cnicExists) {
      return res.status(409).json({ msg: "CNIC already exists" });
    }

    if (mobileExists) {
      return res.status(409).json({ msg: "Mobile number already exists" });
    }

    const newDetails = new PatientDetails({
      userId,
      cnic,
      mobile,
      gender,
      fatherName,
      city,
      address,
    });

    await newDetails.save();
    res.status(200).json({ msg: "Details saved successfully" });

  } catch (err) {
    console.error("❌ Error in saving/updating patient details:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 🔹 GET: Fetch Patient Details by User ID
router.get("/get-details/:userId", async (req, res) => {
  try {
    const details = await PatientDetails.findOne({ userId: req.params.userId });
    if (!details) {
      return res.status(200).json({ success: true, details: null });
    }
    res.status(200).json({ success: true, details });
  } catch (err) {
    console.error("❌ Error in fetching patient details:", err);
    res.status(500).json({ success: false, msg: "Error fetching details", error: err.message });
  }
});

module.exports = router;
