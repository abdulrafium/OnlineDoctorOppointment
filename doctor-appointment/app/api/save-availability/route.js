import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DoctorDetails from '@/models/DoctorDetails';

// Simple endpoint: just save availableTime and fee for existing or new doctor record
export async function POST(request) {
  const { userId, availableTime, fee } = await request.json();

  if (!userId) return NextResponse.json({ success: false, msg: 'User ID is required' }, { status: 400 });
  if (!availableTime || !fee) return NextResponse.json({ success: false, msg: 'Available time and fee are required' }, { status: 400 });

  try {
    await connectDB();
    const existing = await DoctorDetails.findOne({ userId });

    if (existing) {
      await DoctorDetails.updateOne({ userId }, { $set: { availableTime, fee } });
      return NextResponse.json({ success: true, msg: 'Availability updated successfully' });
    }

    // No profile yet — create a minimal record so availability shows up in listings
    await DoctorDetails.create({
      userId,
      cnic: 'N/A',
      gender: 'N/A',
      specialization: 'General',
      city: 'N/A',
      hospital: 'N/A',
      experience: '0',
      fee,
      description: 'N/A',
      availableTime,
    });
    return NextResponse.json({ success: true, msg: 'Availability saved successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error', error: err.message }, { status: 500 });
  }
}
