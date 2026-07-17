import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PatientDetails from '@/models/PatientDetails';

export async function POST(request) {
  const { userId, cnic, mobile, gender, fatherName, city, address } = await request.json();

  if (!userId || !cnic || !mobile || !gender || !fatherName || !city || !address) {
    return NextResponse.json({ msg: 'All fields are required' }, { status: 400 });
  }

  try {
    await connectDB();
    const existing = await PatientDetails.findOne({ userId });

    if (existing) {
      const cnicExists = await PatientDetails.findOne({ cnic, userId: { $ne: userId } });
      const mobileExists = await PatientDetails.findOne({ mobile, userId: { $ne: userId } });

      if (cnicExists) return NextResponse.json({ msg: 'CNIC already exists for another user' }, { status: 409 });
      if (mobileExists) return NextResponse.json({ msg: 'Mobile number already exists for another user' }, { status: 409 });

      const updateResult = await PatientDetails.updateOne({ userId }, { cnic, mobile, gender, fatherName, city, address });
      if (updateResult.modifiedCount > 0) return NextResponse.json({ msg: 'Details updated successfully' });
      return NextResponse.json({ msg: 'No changes were made' });
    }

    const cnicExists = await PatientDetails.findOne({ cnic });
    const mobileExists = await PatientDetails.findOne({ mobile });

    if (cnicExists) return NextResponse.json({ msg: 'CNIC already exists' }, { status: 409 });
    if (mobileExists) return NextResponse.json({ msg: 'Mobile number already exists' }, { status: 409 });

    await new PatientDetails({ userId, cnic, mobile, gender, fatherName, city, address }).save();
    return NextResponse.json({ msg: 'Details saved successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ msg: 'Server error', error: err.message }, { status: 500 });
  }
}
