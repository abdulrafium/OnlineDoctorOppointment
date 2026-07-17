import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';

export async function POST(request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json({ msg: 'Token and new password are required.' }, { status: 400 });
  }

  try {
    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return NextResponse.json({ msg: 'Invalid or expired token.' }, { status: 400 });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return NextResponse.json({ msg: 'Password reset successful.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ msg: 'Invalid or expired token.' }, { status: 400 });
  }
}
