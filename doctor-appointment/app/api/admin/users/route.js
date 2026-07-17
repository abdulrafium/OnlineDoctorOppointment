import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({ role: { $in: ['Patient', 'Doctor'] } }).select('-password');
    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error', error: err.message }, { status: 500 });
  }
}
