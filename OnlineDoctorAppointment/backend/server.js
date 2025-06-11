const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer"); // optional email

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let users = []; // In-memory user storage

// Helper: email format
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// === Register ===
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, username, email, password, role } = req.body;

  // 1. Validate fields
  if (!firstName || !lastName || !username || !email || !password || !role) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  // 2. Check for duplicates
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) return res.status(400).json({ msg: "Email or Username already exists" });

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Store user
  const newUser = { firstName, lastName, username, email, password: hashedPassword, role };
  users.push(newUser);

  //Send welcome email
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });
  // await transporter.sendMail({
  //   from: process.env.EMAIL,
  //   to: email,
  //   subject: "Welcome to Our System",
  //   text: `Hi ${firstName}, you have successfully registered as a ${role}.`,
  // });

  res.json({ msg: "Registered successfully" });
});

// === Login ===
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(user => user.email === email);
  if (!user) return res.status(400).json({ msg: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

  const token = jwt.sign({ email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ msg: "Login successful", token });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
