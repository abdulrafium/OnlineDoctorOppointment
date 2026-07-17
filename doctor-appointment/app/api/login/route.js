import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';

export async function POST(request) {
  const { email, password, role } = await request.json();

  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ msg: 'User not found' }, { status: 404 });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return NextResponse.json({ msg: 'Invalid password' }, { status: 401 });

    if (user.role !== role) {
      return NextResponse.json({ msg: `Access denied: This is a ${user.role} account` }, { status: 403 });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      msg: 'Login successful',
      token,
      role: user.role,
      user: { _id: user._id, email: user.email, username: user.username, role: user.role },
    });
  } catch (err) {
    return NextResponse.json({ msg: 'Server error', error: err.message }, { status: 500 });
  }
}
