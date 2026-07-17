import { Registration } from '@/components/Registration';
import DoctorImage from '@/components/DoctorImage';

export const metadata = {
  title: 'Register - Online Doctor Appointment',
  description: 'Create a new patient account.',
};

export default function RegistrationPage() {
  return (
    <div className="auth-layout">
      <div className="routes-wrapper">
        <Registration role="Patient" />
      </div>
      <DoctorImage />
    </div>
  );
}
