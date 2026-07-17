import mongoose from 'mongoose';

const doctorDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cnic: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  specialization: { type: String, required: true },
  city: { type: String, required: true },
  hospital: { type: String, required: true },
  experience: { type: String, required: true },
  fee: { type: String, required: true },
  description: { type: String, required: true },
  availableTime: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.DoctorDetails || mongoose.model('DoctorDetails', doctorDetailsSchema);
