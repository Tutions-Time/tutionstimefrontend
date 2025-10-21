'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, BookOpen, TrendingUp, Plus, Clock, Video, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchUserProfile } from '@/store/slices/profileSlice';

const mockSessions = [
  {
    id: '1',
    tutorName: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    date: '2024-10-15',
    time: '10:00 AM',
    status: 'scheduled',
    type: 'regular',
  },
  {
    id: '2',
    tutorName: 'Prof. Mike Chen',
    subject: 'Physics',
    date: '2024-10-16',
    time: '2:00 PM',
    status: 'completed',
    type: 'regular',
  },
];

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const studentProfile = useAppSelector((s) => s.profile.studentProfile);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const displayName = studentProfile?.name || 'Student';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={3}
        userRole={(user?.role as 'student' | 'tutor' | 'admin') || 'student'}
        userName={displayName}
        onLogout={logout}
      />

      <Sidebar
        userRole="student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title={displayName}
          greeting
          action={
            <Link href="/search">
              <Button className="bg-primary hover:bg-primary/90 text-text font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Book a Class
              </Button>
            </Link>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">12</p>
                  <p className="text-sm text-muted">Classes This Month</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">5</p>
                  <p className="text-sm text-muted">Active Subjects</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">85%</p>
                  <p className="text-sm text-muted">Progress Score</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text">Upcoming Sessions</h2>
                <Link href="/dashboard/student#sessions">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              {mockSessions.map((session) => (
                <Card key={session.id} className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="font-semibold text-text">
                          {session.tutorName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-text">{session.tutorName}</h3>
                            <p className="text-sm text-muted">{session.subject}</p>
                          </div>
                          {session.status === 'scheduled' ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Upcoming
                            </Badge>
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
                            {new Date(session.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    {session.status === 'scheduled' && (
                      <Button className="bg-primary hover:bg-primary/90 text-text">
                        <Video className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-text">Quick Actions</h2>

              <Card className="p-6 rounded-2xl shadow-soft bg-gradient-to-br from-primary/10 to-primaryWeak hover:shadow-lg transition-base">
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-text mb-2">Find a Tutor</h3>
                <p className="text-sm text-muted mb-4">
                  Browse our verified tutors and book your first class
                </p>
                <Link href="/search">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-text">
                    Browse Tutors
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
                <TrendingUp className="w-10 h-10 text-success mb-4" />
                <h3 className="font-semibold text-text mb-2">Track Progress</h3>
                <p className="text-sm text-muted mb-4">
                  View your learning analytics and achievements
                </p>
                <Link href="/progress">
                  <Button variant="outline" className="w-full">
                    View Progress
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
