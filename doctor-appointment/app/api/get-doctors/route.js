import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';
import DoctorDetails from '@/models/DoctorDetails';

export async function GET() {
  try {
    await connectDB();
    const doctors = await User.find({ role: 'Doctor' });
    const doctorProfiles = await DoctorDetails.find();

    const mergedDoctors = doctors.map((doc) => {
      const profile = doctorProfiles.find((d) => d.userId.toString() === doc._id.toString()) || {};
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
        availableTime: profile.availableTime || '',
      };
    });

    return NextResponse.json({ success: true, doctors: mergedDoctors });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error', error: err.message }, { status: 500 });
  }
}
