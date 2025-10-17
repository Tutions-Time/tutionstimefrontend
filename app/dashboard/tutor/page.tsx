'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, ClipboardList, Users, Wallet, Video, CheckCircle, Clock, BookOpen, Plus
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchUserProfile } from '@/store/slices/profileSlice';

type ClassStatus = 'scheduled' | 'completed' | 'cancelled';

const mockClasses: Array<{
  id: string;
  studentName: string;
  subject: string;
  date: string;  // ISO
  time: string;  // display
  status: ClassStatus;
  type: 'demo' | 'regular';
}> = [
  {
    id: 'c1',
    studentName: 'Aarav Sharma',
    subject: 'Physics',
    date: '2025-10-14',
    time: '6:00 PM',
    status: 'scheduled',
    type: 'demo',
  },
  {
    id: 'c2',
    studentName: 'Ishita Verma',
    subject: 'Mathematics',
    date: '2025-10-12',
    time: '7:30 PM',
    status: 'completed',
    type: 'regular',
  },
];

export default function TutorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const tutorProfile = useAppSelector((s) => s.profile.tutorProfile);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const displayName = tutorProfile?.name || 'Tutor';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={4}
        userRole={(user?.role as 'student' | 'tutor' | 'admin') || 'tutor'}
        userName={displayName}
        onLogout={logout}
      />

      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title={displayName}
          subtitle="Manage your classes, earnings & verification"
          greeting
          action={
            <Link href="/dashboard/tutor#sessions">
              <Button className="bg-primary hover:bg-primary/90 text-text font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </Button>
            </Link>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* KPIs */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">18</p>
                  <p className="text-sm text-muted">Classes This Month</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">12</p>
                  <p className="text-sm text-muted">Active Students</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">6</p>
                  <p className="text-sm text-muted">Pending Assignments</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">₹28,500</p>
                  <p className="text-sm text-muted">Earnings (Oct)</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Upcoming / Recent Classes */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text">My Classes</h2>
                <Link href="/dashboard/tutor#sessions">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              {mockClasses.map((cls) => (
                <Card key={cls.id} className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="font-semibold text-text">
                          {cls.studentName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-text">{cls.studentName}</h3>
                            <p className="text-sm text-muted">{cls.subject} • {cls.type === 'demo' ? 'Demo' : 'Regular'}</p>
                          </div>
                          {cls.status === 'scheduled' ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20">Upcoming</Badge>
                          ) : (
                            <Badge className="bg-success/10 text-success border-success/20">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(cls.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {cls.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    {cls.status === 'scheduled' ? (
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Materials
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-text">
                          <Video className="w-4 h-4 mr-2" />
                          Start Class
                        </Button>
                      </div>
                    ) : (
                      <Link href={`/assignments?class=${cls.id}`}>
                        <Button variant="outline">Review</Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-text">Quick Actions</h2>

              <Card className="p-6 rounded-2xl shadow-soft bg-gradient-to-br from-primary/10 to-primaryWeak hover:shadow-lg transition-base">
                <Video className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-text mb-2">Schedule a Class</h3>
                <p className="text-sm text-muted mb-4">
                  Plan your next session with your students
                </p>
                <Link href="/dashboard/tutor#sessions">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-text">
                    Schedule Now
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                <Wallet className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-text mb-2">Withdraw Earnings</h3>
                <p className="text-sm text-muted mb-4">
                  Check your wallet and request withdrawal
                </p>
                <Link href="/wallet">
                  <Button variant="outline" className="w-full">
                    Go to Wallet
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                <Users className="w-10 h-10 text-success mb-4" />
                <h3 className="font-semibold text-text mb-2">Verify KYC</h3>
                <p className="text-sm text-muted mb-4">
                  Complete your verification to get more bookings
                </p>
                <Link href="/tutor/kyc">
                  <Button variant="outline" className="w-full">
                    Start Verification
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
