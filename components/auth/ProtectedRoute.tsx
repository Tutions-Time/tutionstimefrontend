'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'tutor' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect based on role
        switch (user.role) {
          case 'student':
            router.push('/dashboard/student');
            break;
          case 'tutor':
            router.push('/dashboard/tutor');
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
          default:
            router.push('/login');
        }
      }
    }
  }, [isAuthenticated, user, allowedRoles, router, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}