import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import User from '@/models/Users';
import PatientDetails from '@/models/PatientDetails';
import DoctorDetails from '@/models/DoctorDetails';

export async function POST(request) {
  const { patientUserId, doctorUserId, appointmentDate } = await request.json();

  try {
    await connectDB();

    const existing = await Appointment.findOne({
      patientUserId,
      doctorUserId,
      date: new Date(appointmentDate),
      status: { $ne: 'Cancelled' },
    });

    if (existing) {
      return NextResponse.json({ success: false, msg: 'You already have an appointment with this doctor.' }, { status: 400 });
    }

    const [patientUser, patientDetail, doctorUser, doctorDetail] = await Promise.all([
      User.findById(patientUserId),
      PatientDetails.findOne({ userId: patientUserId }),
      User.findById(doctorUserId),
      DoctorDetails.findOne({ userId: doctorUserId }),
    ]);

    if (!patientUser || !patientDetail || !doctorUser || !doctorDetail) {
      return NextResponse.json({ success: false, msg: 'Missing user or detail record. Please complete your profile.' }, { status: 400 });
    }

    const newAppointment = new Appointment({
      patientUserId,
      patientFirstName: patientUser.firstName,
      patientLastName: patientUser.lastName,
      patientFatherName: patientDetail.fatherName,
      patientGender: patientDetail.gender,
      patientMobile: patientDetail.mobile,
      patientCity: patientDetail.city,
      patientAddress: patientDetail.address,
      patientEmail: patientUser.email,
      doctorUserId,
      doctorFirstName: doctorUser.firstName,
      doctorLastName: doctorUser.lastName,
      doctorSpecialization: doctorDetail.specialization,
      doctorGender: doctorDetail.gender,
      doctorCity: doctorDetail.city,
      doctorHospital: doctorDetail.hospital,
      date: appointmentDate,
      status: 'Pending',
    });

    await newAppointment.save();
    return NextResponse.json({ success: true, msg: 'Appointment booked successfully!' });
  } catch (err) {
    console.error('Error booking appointment:', err);
    return NextResponse.json({ success: false, msg: 'Server error occurred.', error: err.message }, { status: 500 });
  }
}
