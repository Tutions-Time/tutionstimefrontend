'use client';

import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

 
  let allowedRoles: ('admin' | 'tutor' | 'student')[] = ['student'];

  if (pathname.startsWith('/dashboard/admin')) {
    allowedRoles = ['admin'];
  } else if (pathname.startsWith('/dashboard/tutor')) {
    allowedRoles = ['tutor'];
  } else if (pathname.startsWith('/dashboard/student')) {
    allowedRoles = ['student'];
  } else if (pathname.startsWith('/dashboard/meeting')) {
    allowedRoles = ['student', 'tutor', 'admin'];
  }


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

  console.log('📍 Current Path:', pathname);
  console.log('✅ Allowed Roles:', allowedRoles);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      
   
        
        
          <main className="flex-1">{children}</main>
       
      
    </ProtectedRoute>
  );
}
