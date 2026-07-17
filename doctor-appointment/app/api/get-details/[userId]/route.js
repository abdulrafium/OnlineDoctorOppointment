import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PatientDetails from '@/models/PatientDetails';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const details = await PatientDetails.findOne({ userId: params.userId });
    if (!details) return NextResponse.json({ success: true, details: null });
    return NextResponse.json({ success: true, details });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Error fetching details', error: err.message }, { status: 500 });
  }
}
