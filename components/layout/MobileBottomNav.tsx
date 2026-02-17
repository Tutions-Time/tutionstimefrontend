'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  User,
  Calendar,
  Wallet,
  FileText,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'admin' | 'tutor' | 'student' | undefined | null;

type Item = { href: string; label: string; icon: any };

function getItems(role: Role): Item[] {
  if (role === 'admin') {
    return [
      { href: '/dashboard/admin', label: 'Home', icon: LayoutDashboard },
      { href: '/dashboard/admin/users', label: 'Students', icon: Users },
      { href: '/dashboard/admin/tutors', label: 'Tutors', icon: User },
      { href: '/dashboard/admin/refunds', label: 'Refunds', icon: Wallet },
    ];
  }
  if (role === 'tutor') {
    return [
      { href: '/dashboard/tutor', label: 'Home', icon: LayoutDashboard },
      { href: '/dashboard/tutor/search', label: 'Find', icon: Search },
      { href: '/dashboard/tutor/classes', label: 'Classes', icon: Calendar },
      { href: '/dashboard/tutor/group-batches', label: 'Batches', icon: Calendar },
    ];
  }
  return [
    { href: '/dashboard/student', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/student/search', label: 'Find', icon: Search },
    { href: '/dashboard/student/group-batches', label: 'Batches', icon: Calendar },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
  ];
}

export default function MobileBottomNav({
  role,
}: {
  role: Role;
}) {
  const pathname = usePathname();
  const items = getItems(role);

  // Only display on dashboard routes
  const show =
    pathname.startsWith('/dashboard/') ||
    pathname === '/wallet';
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white shadow-lg md:hidden">
      <nav className="grid grid-cols-4">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            pathname.startsWith(it.href + '/');
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 text-xs',
                active ? 'text-primary' : 'text-muted hover:text-text',
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
