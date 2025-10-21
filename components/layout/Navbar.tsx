'use client';

import Link from 'next/link';
import { Bell, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchUserProfile } from '@/store/slices/profileSlice';

interface NavbarProps {
  onMenuClick?: () => void;
  unreadCount?: number;
  userRole?: 'student' | 'tutor' | 'admin';
  userName?: string;
  onLogout?: () => void;
}

export function Navbar({ onMenuClick, unreadCount = 0, userRole, userName, onLogout }: NavbarProps) {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const { studentProfile, tutorProfile } = useAppSelector((s) => s.profile);

  useEffect(() => {
    if ((user?.role === 'student' && !studentProfile) || (user?.role === 'tutor' && !tutorProfile)) {
      dispatch(fetchUserProfile());
    }
  }, [user?.role, studentProfile, tutorProfile, dispatch]);

  const resolvedName =
    userName ??
    (user?.role === 'student'
      ? studentProfile?.name
      : user?.role === 'tutor'
      ? tutorProfile?.name
      : userRole === 'admin'
      ? 'Admin'
      : undefined) ?? 'User';
  const handleLogout = () => {
    if (onLogout) return onLogout();
    logout();
  };
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
              T
            </div>
            <span className="font-bold text-xl text-text hidden sm:inline">Tuitions time</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-danger text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-2 py-1.5 text-sm font-semibold">Notifications</div>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start py-3">
                  <p className="font-medium text-sm">New booking request</p>
                  <p className="text-xs text-muted mt-1">John Doe requested a demo class</p>
                  <p className="text-xs text-muted mt-1">2 minutes ago</p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">{resolvedName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile/setup">Profile</Link>
              </DropdownMenuItem>
              {userRole === 'tutor' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet">Wallet</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics/tutor">Analytics</Link>
                  </DropdownMenuItem>
                </>
              )}
              {userRole === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/analytics">Admin Panel</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger" onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
