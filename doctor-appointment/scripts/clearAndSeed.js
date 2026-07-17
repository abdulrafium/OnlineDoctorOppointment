require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Schemas for clearing
const appointmentSchema = new mongoose.Schema({});
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

const doctorDetailsSchema = new mongoose.Schema({});
const DoctorDetails = mongoose.models.DoctorDetails || mongoose.model('DoctorDetails', doctorDetailsSchema);

const patientDetailsSchema = new mongoose.Schema({});
const PatientDetails = mongoose.models.PatientDetails || mongoose.model('PatientDetails', patientDetailsSchema);

async function clearAndSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    console.log('Clearing Users...');
    await User.deleteMany({});
    console.log('Clearing Appointments...');
    await Appointment.deleteMany({});
    console.log('Clearing DoctorDetails...');
    await DoctorDetails.deleteMany({});
    console.log('Clearing PatientDetails...');
    await PatientDetails.deleteMany({});

    console.log('Seeding Admin account...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'Admin',
    });

    await admin.save();
    console.log('Admin seeded successfully: admin@gmail.com / Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error during clear and seed:', error);
    process.exit(1);
  }
}

clearAndSeed();
