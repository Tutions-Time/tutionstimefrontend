'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Wallet,
  User,
  Users,
  Settings,
  X,
  ClipboardList,
  TrendingUp,
  Layers,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  userRole?: 'student' | 'tutor' | 'admin';
  isOpen?: boolean;
  onClose?: () => void;
}

type NavLink = {
  href: string;
  label: string;
  icon: any;
  /** if true, only exact path matches will mark this link active */
  exact?: boolean;
};

const studentLinks: NavLink[] = [
  { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/student/search', label: 'Find Tutors', icon: Search },
  { href: '/dashboard/student/group-batches', label: 'Group Batches', icon: Calendar },
  { href: '/dashboard/student/demoBookings', label: 'My Classes', icon: ClipboardList },
  { href: '/dashboard/student/demoRequests', label: 'Demo Requests', icon: ClipboardList },
  { href: '/dashboard/student/notes', label: 'Notes', icon: FileText },
  { href: '/dashboard/student/progress', label: 'Progress', icon: FileText },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  // { href: '/notifications', label: 'Notifications', icon: Bell },
];

const tutorLinks: NavLink[] = [
  { href: '/dashboard/tutor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/tutor/search', label: 'Find Students', icon: User },
  { href: '/dashboard/tutor/demo_sessions', label: 'Demo request', icon: Calendar },
  { href: '/dashboard/tutor/classes', label: 'Classes', icon: Calendar },
  { href: '/dashboard/tutor/analytics/tutor', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/tutor/group-batches', label: 'Group Batches', icon: Calendar },
  { href: '/dashboard/tutor/kyc', label: 'Verification', icon: User },
  { href: '/dashboard/tutor/notes', label: 'Notes', icon: FileText },
  { href: '/wallet', label: 'Earnings', icon: Wallet },
  // { href: '/notifications', label: 'Notifications', icon: Bell },
];

const adminLinks: NavLink[] = [
  { href: '/dashboard/admin', label: 'Analytics', icon: BarChart3, exact: true },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/tutors', label: 'Tutors', icon: User },
  { href: '/dashboard/admin/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/dashboard/admin/revenue', label: 'Revenue', icon: Wallet },
  { href: '/dashboard/admin/categories', label: 'Categories', icon: Layers },
  { href: '/dashboard/admin/transactions', label: 'Transactions', icon: ClipboardList },
  { href: '/dashboard/admin/refunds', label: 'Refunds', icon: ClipboardList },
  { href: '/dashboard/admin/sessions', label: 'Sessions', icon: Calendar },
  { href: '/dashboard/admin/marketing/referrals', label: 'Referrals', icon: TrendingUp },
  // { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function Sidebar({ userRole = 'student', isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const links =
    userRole === 'admin' ? adminLinks : userRole === 'tutor' ? tutorLinks : studentLinks;

  const isLinkActive = (href: string, exact?: boolean) => {
    // normalize trailing slashes
    const cleanHref = href.endsWith('/') ? href.slice(0, -1) : href;
    const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    if (exact) return cleanPath === cleanHref; // Dashboard must be exact

    // Non-exact links: active on exact match OR sub-paths
    return cleanPath === cleanHref || cleanPath.startsWith(cleanHref + '/');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r transition-transform duration-200 z-40',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {links.map((link) => {
            const active = isLinkActive(link.href, link.exact);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base',
                  active
                    ? 'bg-primary text-text'
                    : 'text-muted hover:bg-primaryWeak hover:text-text'
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/profile/setup"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-primaryWeak hover:text-text transition-base"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div> */}
      </aside>
    </>
  );
}
