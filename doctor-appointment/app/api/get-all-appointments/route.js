import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET() {
  try {
    await connectDB();
    const appointments = await Appointment.find().sort({ date: -1 });
    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ success: false, msg: 'No appointments found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, appointments });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error while fetching appointments.' }, { status: 500 });
  }
}
