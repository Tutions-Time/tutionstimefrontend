'use client';

import Link from 'next/link';
import { Bell, User, Menu, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

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
import { setUnreadCount } from '@/store/slices/notificationSlice';
import {
  listNotifications,
  listAdminNotifications,
  markNotificationRead,
  markAdminNotificationRead,
  markAllNotificationsRead,
  markAllAdminNotificationsRead,
  deleteNotification,
  deleteAdminNotification,
  deleteAllNotifications,
  deleteAllAdminNotifications,
} from '@/services/notificationService';

interface NavbarProps {
  onMenuClick?: () => void;
  unreadCount?: number;
  userRole?: 'student' | 'tutor' | 'admin';
  userName?: string;
  onLogout?: () => void;
}

export function Navbar({ onMenuClick, unreadCount: _unreadCount, userName, userRole, onLogout }: NavbarProps) {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();

  const { studentProfile, tutorProfile } = useAppSelector((s) => s.profile);
  const storeUnread = useAppSelector((s) => s.notification?.unreadCount ?? 0);
  const effectiveUnread = storeUnread;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerItems, setDrawerItems] = useState<any[]>([]);
  const isAdmin = user?.role === 'admin';

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
      : '';


  // ---------------- LOGOUT HANDLER ----------------
  const handleLogout = () => {
    (onLogout ?? logout)();
  };

  const loadNotifications = async () => {
    setDrawerLoading(true);
    try {
      const items = isAdmin ? await listAdminNotifications() : await listNotifications();
      setDrawerItems(items);
      dispatch(setUnreadCount(items.filter((n: any) => !(n.read ?? n.isRead)).length));
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleToggleDrawer = () => {
    const next = !drawerOpen;
    setDrawerOpen(next);
    if (next) {
      loadNotifications();
    }
  };

  const handleMarkRead = async (id: string) => {
    if (isAdmin) {
      await markAdminNotificationRead(id);
    } else {
      await markNotificationRead(id);
    }
    setDrawerItems((prev) => {
      const next = prev.map((n: any) =>
        n._id === id ? { ...n, read: true, isRead: true } : n
      );
      dispatch(setUnreadCount(next.filter((n) => !(n.read ?? n.isRead)).length));
      return next;
    });
  };

  const handleMarkAllRead = async () => {
    if (isAdmin) {
      await markAllAdminNotificationsRead();
    } else {
      await markAllNotificationsRead();
    }
    setDrawerItems((prev) => prev.map((n: any) => ({ ...n, read: true, isRead: true })));
    dispatch(setUnreadCount(0));
  };

  const handleDelete = async (id: string) => {
    if (isAdmin) {
      await deleteAdminNotification(id);
    } else {
      await deleteNotification(id);
    }
    setDrawerItems((prev) => {
      const next = prev.filter((n: any) => n._id !== id);
      dispatch(setUnreadCount(next.filter((n: any) => !(n.read ?? n.isRead)).length));
      return next;
    });
  };

  const handleDeleteAll = async () => {
    if (isAdmin) {
      await deleteAllAdminNotifications();
    } else {
      await deleteAllNotifications();
    }
    setDrawerItems([]);
    dispatch(setUnreadCount(0));
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

          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Notifications" onClick={handleToggleDrawer}>
              <Bell className="h-5 w-5" />
            </Button>
            {effectiveUnread > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-[20px] justify-center rounded-full px-1 text-[10px]">
                {effectiveUnread > 99 ? '99+' : effectiveUnread}
              </Badge>
            )}
          </div>

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
              {user?.role !== 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href={profileUrl}>Profile</Link>
                </DropdownMenuItem>
              )}

              {/* Tutor-only options */}
              {user?.role === 'tutor' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet">Wallet</Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/analytics/tutor">Analytics</Link>
                  </DropdownMenuItem> */}
                </>
              )}

              {/* Admin-only options */}
              {/* {user?.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/analytics">Admin Panel</Link>
                </DropdownMenuItem>
              )} */}

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-danger" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold">Notifications</div>
              <div className="flex items-center gap-2">
                {drawerItems.length > 0 && (
                  <>
                    <Button size="sm" variant="outline" onClick={handleMarkAllRead}>
                      Mark all read
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleDeleteAll}>
                      Delete all
                    </Button>
                  </>
                )}
                <Button size="icon" variant="ghost" onClick={() => setDrawerOpen(false)} aria-label="Close notifications">
                  ✕
                </Button>
              </div>
            </div>
            <div className="max-h-[calc(100vh-56px)] overflow-y-auto p-4 space-y-3">
              {drawerLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
              {!drawerLoading && drawerItems.length === 0 && (
                <div className="text-sm text-muted-foreground">No notifications yet.</div>
              )}
              {drawerItems.map((n) => {
                const isRead = n.read ?? n.isRead;
                return (
                <div key={n._id} className={`rounded-lg border p-3 ${isRead ? 'bg-white' : 'bg-yellow-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{n.title}</div>
                      <div className="text-xs text-muted-foreground">{n.body || n.message}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isRead && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkRead(n._id)}>
                          Mark read
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete notification"
                        onClick={() => handleDelete(n._id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
