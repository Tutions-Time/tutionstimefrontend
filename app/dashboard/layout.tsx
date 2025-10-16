'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'tutor':
        return 'Tutor Dashboard';
      case 'student':
        return 'Student Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <ProtectedRoute>
      <div className="">
        {/* <Topbar 
          title={getDashboardTitle()} 
          greeting={true}
        /> */}
        <div className="flex">
          {/* <Sidebar /> */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}