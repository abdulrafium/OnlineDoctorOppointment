import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DoctorDetails from '@/models/DoctorDetails';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const profile = await DoctorDetails.findOne({ userId: params.userId });
    if (!profile) return NextResponse.json({ success: true, profile: null });
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Error fetching doctor profile', error: err.message }, { status: 500 });
  }
}
