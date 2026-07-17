import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';

export async function POST(request) {
  const { token } = await request.json();

  if (!token) return NextResponse.json({ success: false, message: 'Token is required' }, { status: 401 });

  try {
    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Invalid token', error: err.message }, { status: 401 });
  }
}
