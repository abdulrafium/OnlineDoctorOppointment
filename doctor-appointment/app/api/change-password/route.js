import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';

export async function POST(request) {
  const { token, currentPassword, newPassword } = await request.json();

  if (!token || !currentPassword || !newPassword) {
    return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
  }

  try {
    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 401 });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error', error: err.message }, { status: 500 });
  }
}
