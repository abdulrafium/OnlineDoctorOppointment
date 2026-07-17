'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const ProtectedRoute = ({ children, allowedRole }) => {
  const router = useRouter();
  const pathname = usePathname();

  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== allowedRole) {
    const loginPath =
      allowedRole === 'Patient' ? '/patient' :
      allowedRole === 'Doctor' ? '/doctor' :
      allowedRole === 'Admin' ? '/admin' :
      '/';
    router.replace(loginPath);
    return null;
  }

  return children;
};

export default ProtectedRoute;
