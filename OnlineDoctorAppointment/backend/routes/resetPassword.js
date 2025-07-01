const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/Users");
require("dotenv").config();

const router = express.Router();

// ============ 📩 FORGOT PASSWORD ============
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"Doctor Appointment System" <your_email@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4fadad; text-align: center;">Reset Your Password</h2>
            <p style="font-size: 16px; color: #333;">Hi <strong>${user.firstName}</strong>,</p>
            <p style="font-size: 16px; color: #333;">
              We received a request to reset your password. Click the button below to proceed. This link will expire in <strong>15 minutes</strong>.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4fadad; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #555;">If you didn’t request this, you can safely ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 14px; color: #999;">&copy; ${new Date().getFullYear()} Online Doctor Appointment System</p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email error:", err);
        return res.status(500).json({ msg: "Failed to send email." });
      }

      res.json({ msg: "Password reset link sent." });
    });
  } catch (err) {
    console.error("Forgot password server error:", err);
    res.status(500).json({ msg: "Server error." });
  }
});

// ============ 🔁 RESET PASSWORD ============
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ msg: "Token and new password are required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Password reset successful." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ msg: "Invalid or expired token." });
  }
});

module.exports = router;
