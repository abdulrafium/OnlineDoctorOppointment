import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function POST(request) {
  const { userId, role } = await request.json();

  if (!userId || !role) {
    return NextResponse.json({ success: false, msg: 'Missing userId or role' }, { status: 400 });
  }

  try {
    await connectDB();
    
    let query = {};
    if (role === 'Patient') {
      query = { patientUserId: userId };
    } else if (role === 'Doctor') {
      query = { doctorUserId: userId };
    } else {
      return NextResponse.json({ success: false, msg: 'Invalid role' }, { status: 400 });
    }

    // Return newest appointments first
    const appointments = await Appointment.find(query).sort({ date: -1 });
    return NextResponse.json({ success: true, appointments });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Failed to fetch appointments.' }, { status: 500 });
  }
}
