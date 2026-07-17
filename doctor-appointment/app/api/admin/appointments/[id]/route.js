import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    await connectDB();
    const deleted = await Appointment.findByIdAndDelete(id);
    
    if (!deleted) {
      return NextResponse.json({ success: false, msg: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, msg: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: 'Server error', error: err.message }, { status: 500 });
  }
}
