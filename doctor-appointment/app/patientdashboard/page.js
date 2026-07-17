'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import PatientDashboard from '@/components/PatientDashboard';

export default function PatientDashboardPage() {
  return (
    <ProtectedRoute allowedRole="Patient">
      <div className="main-layout">
        <PatientDashboard />
      </div>
    </ProtectedRoute>
  );
}
