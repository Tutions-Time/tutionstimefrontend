'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';

type Sess = {
  _id: string;
  status: string;
  attendance: string;
  startDateTime: string;
  meetingLink?: string;
  regularClassId?: any;
  groupBatchId?: any;
  recordingUrl?: string;
  notesUrl?: string;
  assignmentUrl?: string;
};

type DemoBooking = {
  _id: string;
  status: string;
  subject?: string;
  preferredDate?: string;
  preferredTime?: string;
  meetingLink?: string;
  student?: { name?: string; email?: string } | null;
  tutor?: { name?: string; email?: string } | null;
};

export default function AdminSessionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('scheduled');
  const [student, setStudent] = useState<string>('');
  const [tutor, setTutor] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>([]);
  const [sessionTab, setSessionTab] = useState<'one' | 'batch' | 'demo'>('one');

  const refresh = () => {
    setLoading(true);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    Promise.all([
      api.get('/admin/sessions', {
        params: {
          status,
          student: student.trim() || undefined,
          tutor: tutor.trim() || undefined,
          page,
          limit,
        },
      }),
      api.get('/admin/bookings', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      }),
    ])
      .then(([sessRes, bookingRes]) => {
        const res = sessRes;
        setSessions(res.data?.data || []);
        const p = res.data?.pagination;
        if (p) {
          setTotal(p.total || 0);
          setPages(p.pages || 1);
        }
        const bookings = bookingRes.data?.data || [];
        setDemoBookings(bookings);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, [status, page, limit]);
  useEffect(() => { setPage(1); }, [status]);
  useEffect(() => {
    const h = setTimeout(() => { setPage(1); refresh(); }, 400);
    return () => clearTimeout(h);
  }, [student, tutor]);

  const todaySessions = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    return sessions.filter((s) => {
      if (!s.startDateTime) return false;
      const dt = new Date(s.startDateTime);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    });
  }, [sessions]);

  const oneToOneSessions = useMemo(
    () => todaySessions.filter((s) => !(s as any).groupBatchId && s.regularClassId),
    [todaySessions],
  );

  const batchSessions = useMemo(
    () => todaySessions.filter((s) => (s as any).groupBatchId),
    [todaySessions],
  );

  const todayDemoBookings = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    return demoBookings.filter((b) => {
      if (!b.preferredDate) return false;
      const dt = new Date(b.preferredDate);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    });
  }, [demoBookings]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={3} userRole="admin" userName="Admin" />
        <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64">
          <Topbar title="Sessions" subtitle="Monitor attendance and resources" />

          <main className="p-4 lg:p-6 space-y-6">
            <Card className="p-3 rounded-2xl bg-white shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
                <select className="h-8 rounded-md border px-2 text-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="not-scheduled">Not Scheduled</option>
                </select>
                <input className="h-8 rounded-md border px-2 text-xs" placeholder="Student" value={student} onChange={(e) => setStudent(e.target.value)} />
                <input className="h-8 rounded-md border px-2 text-xs" placeholder="Tutor" value={tutor} onChange={(e) => setTutor(e.target.value)} />
                <select className="h-8 rounded-md border px-2 text-xs" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <Button size="sm" variant="outline" onClick={refresh}>Refresh</Button>
                <Link href="/dashboard/admin/revenue"><Button size="sm" variant="outline">Revenue</Button></Link>
              </div>
            </Card>

            <Card className="rounded-2xl bg-white shadow-sm">
              {loading ? (
                <div className="p-10 text-center text-muted text-sm">Loading sessions...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                      <div className="text-sm font-semibold">Today's Sessions</div>
                      <div className="text-xs text-muted">Only sessions scheduled for today</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Total {todaySessions.length}
                    </Badge>
                  </div>

                  <div className="flex justify-center mt-3 mb-1 px-4">
                    <div className="flex p-1 bg-gray-50 rounded-full border gap-1">
                      <button
                        onClick={() => setSessionTab('one')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                          sessionTab === 'one' ? 'bg-white shadow text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        1:1 Sessions
                      </button>
                      <button
                        onClick={() => setSessionTab('batch')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                          sessionTab === 'batch' ? 'bg-white shadow text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        Batch Sessions
                      </button>
                      <button
                        onClick={() => setSessionTab('demo')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                          sessionTab === 'demo' ? 'bg-white shadow text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        Demo Sessions
                      </button>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {sessionTab === 'one' ? (
                      oneToOneSessions.length === 0 ? (
                        <div className="text-xs text-muted text-center py-6">
                          No 1:1 sessions for today.
                        </div>
                      ) : (
                        oneToOneSessions.map((s) => (
                          <div
                            key={s._id}
                            className="flex items-center justify-between border rounded-lg px-3 py-2 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="font-semibold">
                                {s.startDateTime
                                  ? new Date(s.startDateTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '-'}
                              </div>
                              <div className="text-muted">
                                {(s as any).regularClassId?.subject || (s as any).subject || '-'}
                              </div>
                              <div className="text-muted">
                                Student: {(s as any).studentId?.name || '-'}
                              </div>
                              <div className="text-muted">
                                Tutor: {(s as any).tutorId?.name || '-'}
                              </div>
                              {(s.recordingUrl || s.notesUrl || s.assignmentUrl) && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  {s.recordingUrl && (
                                    <a
                                      className="text-primary underline"
                                      target="_blank"
                                      href={s.recordingUrl}
                                    >
                                      Rec
                                    </a>
                                  )}
                                  {s.notesUrl && (
                                    <a
                                      className="text-primary underline"
                                      target="_blank"
                                      href={s.notesUrl}
                                    >
                                      Notes
                                    </a>
                                  )}
                                  {s.assignmentUrl && (
                                    <a
                                      className="text-primary underline"
                                      target="_blank"
                                      href={s.assignmentUrl}
                                    >
                                      Assign
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                className={
                                  s.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : s.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }
                              >
                                {s.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )
                    ) : sessionTab === 'batch' ? (
                      batchSessions.length === 0 ? (
                        <div className="text-xs text-muted text-center py-6">
                          No batch sessions for today.
                        </div>
                      ) : (
                        batchSessions.map((s) => (
                          <div
                            key={s._id}
                            className="flex items-center justify-between border rounded-lg px-3 py-2 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="font-semibold">
                                {s.startDateTime
                                  ? new Date(s.startDateTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '-'}
                              </div>
                              <div className="text-muted">
                                Batch: {(s as any).regularClassId?.subject || (s as any).subject || '-'}
                              </div>
                              <div className="text-muted">
                                Tutor: {(s as any).tutorId?.name || '-'}
                              </div>
                              <div className="text-muted">
                                Student: {(s as any).studentId?.name || '-'}
                              </div>
                              {(s.recordingUrl || s.notesUrl || s.assignmentUrl) && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  {s.recordingUrl && (
                                    <a
                                      className="text-primary underline"
                                      target="_blank"
                                      href={s.recordingUrl}
                                    >
                                      Rec
                                    </a>
                                  )}
                                  {s.notesUrl && (
                                    <a
                                      className="text-primary underline"
                                      target="_blank"
                                      href={s.notesUrl}
                                    >
                                      Notes
                                    </a>
                                  )}
                                  {s.assignmentUrl && (
                                    <a
                                      className="text-primary underline"
                                      target="_blank"
                                      href={s.assignmentUrl}
                                    >
                                      Assign
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                className={
                                  s.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : s.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }
                              >
                                {s.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )
                    ) : todayDemoBookings.length === 0 ? (
                      <div className="text-xs text-muted text-center py-6">
                        No demo sessions for today.
                      </div>
                    ) : (
                      todayDemoBookings.map((s) => (
                        <div
                          key={s._id}
                          className="flex items-center justify-between border rounded-lg px-3 py-2 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {s.preferredTime || '-'}
                            </div>
                            <div className="text-muted">
                              Demo - {s.subject || '-'}
                            </div>
                            <div className="text-muted">
                              Student: {s.student?.name || '-'}
                            </div>
                            <div className="text-muted">
                              Tutor: {s.tutor?.name || '-'}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              className={
                                s.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : s.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }
                            >
                              {s.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
