import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import DoctorDetails from '@/models/DoctorDetails';

export async function GET(request, { params }) {
  const { doctorUserId } = params;

  try {
    await connectDB();
    const appointments = await Appointment.find({ doctorUserId }).sort({ date: -1 });
    const doctorDetail = await DoctorDetails.findOne({ userId: doctorUserId });

    return NextResponse.json({ success: true, appointments, fee: doctorDetail?.fee || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error while fetching doctor appointments.' }, { status: 500 });
  }
}
