import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function DELETE() {
  try {
    await connectDB();
    await Appointment.deleteMany({});
    return NextResponse.json({ success: true, msg: 'All appointments deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error', error: err.message }, { status: 500 });
  }
}
