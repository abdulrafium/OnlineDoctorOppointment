import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request, { params }) {
  const { doctorUserId } = params;

  try {
    await connectDB();
    const confirmedAppointments = await Appointment.find({ doctorUserId, status: 'Confirmed' }).sort({ date: -1 });

    if (!confirmedAppointments || confirmedAppointments.length === 0) {
      return NextResponse.json({ success: true, patients: [], msg: 'No confirmed patients found.' });
    }

    const patients = confirmedAppointments.map((appt) => ({
      name: `${appt.patientFirstName} ${appt.patientLastName}`,
      mobile: appt.patientMobile,
      gender: appt.patientGender,
      city: appt.patientCity,
      address: appt.patientAddress,
      appointmentDate: appt.date,
    }));

    return NextResponse.json({ success: true, patients });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Failed to fetch confirmed patients.', error: err.message }, { status: 500 });
  }
}
