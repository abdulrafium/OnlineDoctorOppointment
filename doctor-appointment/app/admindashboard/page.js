'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRole="Admin">
      <div className="main-layout">
        <AdminDashboard />
      </div>
    </ProtectedRoute>
  );
}
