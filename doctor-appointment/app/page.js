import RoleSelection from '@/components/RoleSelection';
import DoctorImage from '@/components/DoctorImage';

export const metadata = {
  title: 'Online Doctor Appointment System - Select Role',
  description: 'Book doctor appointments online. Select your role to get started.',
};

export default function Home() {
  return (
    <div className="auth-layout">
      <div className="routes-wrapper">
        <RoleSelection />
      </div>
      <DoctorImage />
    </div>
  );
}
