const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/Users");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post("/api/register", async (req, res) => {
  const { firstName, lastName, username, email, password, role } = req.body;

  if (!firstName || !lastName || !username || !email || !password || !role) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ msg: "Email or Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.json({ msg: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// const bcrypt = require('bcrypt'); // Add this at the top if not already
// const User = require('./models/User'); // ✅ make sure path is correct



app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(401).json({ msg: "Invalid password" });

    // Role check
    if (user.role !== role) {
      return res.status(403).json({ msg: `Access denied: This is a ${user.role} account` });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ msg: "Login successful", token, role: user.role });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
