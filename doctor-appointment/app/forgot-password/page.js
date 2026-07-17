import ForgotPassword from '@/components/ForgotPassword';
import DoctorImage from '@/components/DoctorImage';

export const metadata = {
  title: 'Forgot Password - Online Doctor Appointment',
  description: 'Reset your password via email.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-layout">
      <div className="routes-wrapper">
        <ForgotPassword />
      </div>
      <DoctorImage />
    </div>
  );
}
