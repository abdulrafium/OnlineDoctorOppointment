import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import User from '@/models/Users';

export async function POST(request) {
  try {
    const { email } = await request.json();
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) return NextResponse.json({ msg: 'User not found.' }, { status: 400 });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: '"Doctor Appointment System" <noreply@docappoint.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4fadad; text-align: center;">Reset Your Password</h2>
            <p style="font-size: 16px; color: #333;">Hi <strong>${user.firstName}</strong>,</p>
            <p style="font-size: 16px; color: #333;">We received a request to reset your password. Click the button below to proceed. This link will expire in <strong>15 minutes</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4fadad; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #555;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 14px; color: #999;">&copy; ${new Date().getFullYear()} Online Doctor Appointment System</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ msg: 'Password reset link sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ msg: 'Server error.' }, { status: 500 });
  }
}
