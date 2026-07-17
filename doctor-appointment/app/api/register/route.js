import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(request) {
  const { firstName, lastName, username, email, password, role } = await request.json();

  if (!firstName || !lastName || !username || !email || !password || !role) {
    return NextResponse.json({ msg: 'All fields are required' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ msg: 'Invalid email format' }, { status: 400 });
  }

  try {
    await connectDB();
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ msg: 'Email or Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, username, email, password: hashedPassword, role });
    await newUser.save();

    return NextResponse.json({ msg: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}
