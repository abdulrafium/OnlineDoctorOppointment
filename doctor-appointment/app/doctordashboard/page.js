'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import DoctorDashboard from '@/components/DoctorDashboard';

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute allowedRole="Doctor">
      <div className="main-layout">
        <DoctorDashboard />
      </div>
    </ProtectedRoute>
  );
}
