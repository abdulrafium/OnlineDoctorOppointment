import ResetPassword from '@/components/ResetPassword';
import DoctorImage from '@/components/DoctorImage';

export const metadata = {
  title: 'Reset Password - Online Doctor Appointment',
  description: 'Set your new password.',
};

export default function ResetPasswordPage() {
  return (
    <div className="auth-layout">
      <div className="routes-wrapper">
        <ResetPassword />
      </div>
      <DoctorImage />
    </div>
  );
}
