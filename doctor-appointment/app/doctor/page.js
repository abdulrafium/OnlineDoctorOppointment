import { Login } from '@/components/Login';
import DoctorImage from '@/components/DoctorImage';

export const metadata = {
  title: 'Doctor Login - Online Doctor Appointment',
  description: 'Login as a doctor to manage your appointments.',
};

export default function DoctorPage() {
  return (
    <div className="auth-layout">
      <div className="routes-wrapper">
        <Login role="Doctor" />
      </div>
      <DoctorImage />
    </div>
  );
}
