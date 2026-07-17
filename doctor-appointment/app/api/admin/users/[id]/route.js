import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';
import DoctorDetails from '@/models/DoctorDetails';
import PatientDetails from '@/models/PatientDetails';
import Appointment from '@/models/Appointment';

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    await connectDB();
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    // Delete details based on role
    if (user.role === 'Doctor') {
      await DoctorDetails.findOneAndDelete({ userId: id });
      await Appointment.deleteMany({ doctorUserId: id });
    } else if (user.role === 'Patient') {
      await PatientDetails.findOneAndDelete({ userId: id });
      await Appointment.deleteMany({ patientUserId: id });
    }

    return NextResponse.json({ success: true, msg: 'User and related data deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error', error: err.message }, { status: 500 });
  }
}
