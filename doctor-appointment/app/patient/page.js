import { PatientLogin } from '@/components/PatientLogin';
import DoctorImage from '@/components/DoctorImage';

export const metadata = {
  title: 'Patient Login - Online Doctor Appointment',
  description: 'Login as a patient to book doctor appointments.',
};

export default function PatientPage() {
  return (
    <div className="auth-layout">
      <div className="routes-wrapper">
        <PatientLogin role="Patient" />
      </div>
      <DoctorImage />
    </div>
  );
}
