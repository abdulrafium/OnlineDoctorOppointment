import { Login } from '@/components/Login';
import DoctorImage from '@/components/DoctorImage';

export const metadata = {
  title: 'Admin Login - Online Doctor Appointment',
  description: 'Login as an admin to manage the system.',
};

export default function AdminPage() {
  return (
    <div className="auth-layout">
      <div className="routes-wrapper">
        <Login role="Admin" />
      </div>
      <DoctorImage />
    </div>
  );
}
