import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DoctorDetails from '@/models/DoctorDetails';

export async function POST(request) {
  const { userId, cnic, gender, specialization, city, hospital, experience, fee, description, availableTime } = await request.json();

  if (!userId) return NextResponse.json({ success: false, msg: 'User ID is required' }, { status: 400 });

  if (!cnic || !gender || !specialization || !city || !hospital || !experience || !fee || !description) {
    return NextResponse.json({ success: false, msg: 'All fields are required' }, { status: 400 });
  }

  try {
    await connectDB();
    const existingProfile = await DoctorDetails.findOne({ userId });

    // Check if CNIC belongs to someone else
    const cnicExists = await DoctorDetails.findOne({ cnic, userId: { $ne: userId } });
    if (cnicExists && cnic !== 'N/A') {
      return NextResponse.json({ success: false, msg: 'CNIC already exists for another user' }, { status: 409 });
    }

    const updateFields = {
      cnic, gender, specialization, city, hospital, experience, fee, description, availableTime: availableTime || ''
    };

    if (existingProfile) {
      await DoctorDetails.updateOne({ userId }, { $set: updateFields });
      return NextResponse.json({ success: true, msg: 'Doctor profile updated successfully' });
    }

    await new DoctorDetails({ userId, ...updateFields }).save();
    return NextResponse.json({ success: true, msg: 'Doctor profile created successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error', error: err.message }, { status: 500 });
  }
}
