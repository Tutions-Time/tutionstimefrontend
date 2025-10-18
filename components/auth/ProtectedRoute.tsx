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
    if (isLoading) return;

    // If not logged in
    if (!isAuthenticated) {
      // Admin should go to admin-login
      if (allowedRoles?.includes('admin')) {
        console.log("allowed roles: admin")
        router.push('/admin-login');
      } else {
        console.log("allowed roles: not admin")

        router.push('/login');
      }
      return;
    }

    // If logged in but not allowed for this route
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
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
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
