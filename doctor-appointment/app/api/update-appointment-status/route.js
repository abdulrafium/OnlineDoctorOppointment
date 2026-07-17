import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import DoctorDetails from '@/models/DoctorDetails';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, message) => {
  await transporter.sendMail({
    from: '"Doctor Appointment System" <noreply@docappoint.com>',
    to,
    subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4fadad; text-align: center;">Doctor Appointment Notification</h2>
          <p style="font-size: 16px; color: #333;">${message}</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #999;">If you have any questions, please contact support.</p>
          <p style="font-size: 14px; color: #999;">&copy; ${new Date().getFullYear()} Online Doctor Appointment System</p>
        </div>
      </div>
    `,
  });
};

export async function POST(request) {
  const { _id, status } = await request.json();

  try {
    await connectDB();
    const updated = await Appointment.findByIdAndUpdate(_id, { status }, { new: true });

    if (!updated) return NextResponse.json({ success: false, msg: 'Appointment not found' }, { status: 404 });

    const doctorDetail = await DoctorDetails.findOne({ userId: updated.doctorUserId });

    let formattedDoctorTime = 'N/A';
    if (doctorDetail?.availableTime) {
      const [hour, minute] = doctorDetail.availableTime.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hour));
      timeDate.setMinutes(parseInt(minute));
      formattedDoctorTime = timeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const formattedDate = new Date(updated.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const subject = status === 'Confirmed'
      ? 'Your appointment has been confirmed'
      : 'Your appointment has been rejected';

    const message = status === 'Confirmed'
      ? `Dear <strong>${updated.patientFirstName} ${updated.patientLastName}</strong>, your appointment with 
         <strong>Dr. ${updated.doctorFirstName} ${updated.doctorLastName}</strong> has been 
         <span style="color: green; font-weight: bold;">confirmed</span>.<br/><br/>
         📅 <strong>Date:</strong> ${formattedDate}<br/>
         🕒 <strong>Time:</strong> ${formattedDoctorTime}<br/>
         🏥 <strong>Hospital:</strong> ${updated.doctorHospital}<br/>
         🏙️ <strong>City:</strong> ${updated.doctorCity}<br/><br/>
         Please be on time. Thank you for using our service.`
      : `Dear <strong>${updated.patientFirstName} ${updated.patientLastName}</strong>, we regret to inform you that your appointment with 
         <strong>Dr. ${updated.doctorFirstName} ${updated.doctorLastName}</strong> on <strong>${formattedDate}</strong> 
         has been <span style="color: red; font-weight: bold;">rejected</span>.<br/><br/>
         🏥 <strong>Hospital:</strong> ${updated.doctorHospital}<br/>
         🏙️ <strong>City:</strong> ${updated.doctorCity}<br/><br/>
         You may try booking a new appointment.`;

    await sendEmail(updated.patientEmail, subject, message);

    return NextResponse.json({ success: true, msg: 'Status updated and email sent', updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error while updating status.' }, { status: 500 });
  }
}
