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
import { useEffect, useRef } from 'react';

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
  const barRef = useRef<HTMLDivElement | null>(null);

  // Only display on dashboard routes
  const show =
    pathname.startsWith('/dashboard/') ||
    pathname === '/wallet';

  // Ensure page content isn't hidden behind the fixed bottom bar on mobile
  useEffect(() => {
    const el = barRef.current;

    const applyPadding = () => {
      const height = el?.offsetHeight || 0;
      // Apply padding only for small screens where the bar is visible
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isMobile && show && height > 0) {
        document.body.style.paddingBottom = `${height}px`;
      } else {
        document.body.style.paddingBottom = '';
      }
    };

    // When bar isn't shown, clear any padding and exit early
    if (!show) {
      document.body.style.paddingBottom = '';
      return;
    }

    applyPadding();
    window.addEventListener('resize', applyPadding);

    // Observe bar height changes
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(applyPadding);
      ro.observe(el);
    }

    return () => {
      window.removeEventListener('resize', applyPadding);
      if (ro) ro.disconnect();
      document.body.style.paddingBottom = '';
    };
  }, [show]);

  return show ? (
    <div ref={barRef} className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white shadow-lg md:hidden pb-[env(safe-area-inset-bottom)]">
      <nav className="grid grid-cols-4">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn('flex flex-col items-center justify-center py-2 text-xs', active ? 'text-primary' : 'text-muted hover:text-text')}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  ) : null;
}
