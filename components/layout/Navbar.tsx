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

export function Navbar({ onMenuClick, unreadCount = 0, userName, userRole, onLogout }: NavbarProps) {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();

  const { studentProfile, tutorProfile } = useAppSelector((s) => s.profile);

  // ---------------- FETCH USER PROFILE IF LOGGED IN ----------------
  useEffect(() => {
    if (!user?.role) return;

    const needsStudentProfile = user.role === 'student' && !studentProfile;
    const needsTutorProfile = user.role === 'tutor' && !tutorProfile;

    if (needsStudentProfile || needsTutorProfile) {
      dispatch(fetchUserProfile());
    }
  }, [user?.role, studentProfile, tutorProfile, dispatch]);


  // ---------------- RESOLVE NAME PROPERLY ----------------
  const resolvedName =
    userName ?? (
      user?.role === 'student'
        ? studentProfile?.name || 'Student'
        : user?.role === 'tutor'
        ? tutorProfile?.name || 'Tutor'
        : user?.role === 'admin'
        ? 'Admin'
        : 'User'
    );


  // ---------------- PROFILE URL BASED ON ROLE ----------------
  const profileUrl =
    user?.role === 'student'
      ? '/dashboard/student/profile'
      : user?.role === 'tutor'
      ? '/dashboard/tutor/profile'
      : '/admin/profile';


  // ---------------- LOGOUT HANDLER ----------------
  const handleLogout = () => {
    (onLogout ?? logout)();
  };


  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">

        {/* LEFT SECTION */}
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

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 sm:gap-4">

       
          {/* USER DROPDOWN */}
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
              {/* PROFILE LINK */}
              <DropdownMenuItem asChild>
                <Link href={profileUrl}>Profile</Link>
              </DropdownMenuItem>

              {/* Tutor-only options */}
              {user?.role === 'tutor' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet">Wallet</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics/tutor">Analytics</Link>
                  </DropdownMenuItem>
                </>
              )}

              {/* Admin-only options */}
              {user?.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/analytics">Admin Panel</Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-danger" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
}
