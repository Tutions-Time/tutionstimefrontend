'use client';

import { useEffect, useState } from 'react';
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
  recordingUrl?: string;
  notesUrl?: string;
  assignmentUrl?: string;
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

  const refresh = () => {
    setLoading(true);
    api
      .get('/admin/sessions', { params: { status, student: student.trim() || undefined, tutor: tutor.trim() || undefined, page, limit } })
      .then((res) => {
        setSessions(res.data?.data || []);
        const p = res.data?.pagination;
        if (p) {
          setTotal(p.total || 0);
          setPages(p.pages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, [status, page, limit]);
  useEffect(() => { setPage(1); }, [status]);
  useEffect(() => {
    const h = setTimeout(() => { setPage(1); refresh(); }, 400);
    return () => clearTimeout(h);
  }, [student, tutor]);

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
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr className="text-left uppercase tracking-wider text-muted">
                          <th className="px-3 py-2">Start</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Attendance</th>
                          <th className="px-3 py-2">Student</th>
                          <th className="px-3 py-2">Tutor</th>
                          <th className="px-3 py-2">Subject</th>
                          <th className="px-3 py-2">Resources</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((s) => (
                          <tr key={s._id} className="border-t">
                            <td className="px-3 py-2 whitespace-nowrap">{s.startDateTime ? new Date(s.startDateTime).toLocaleString() : '-'}</td>
                            <td className="px-3 py-2"><Badge className={s.status === 'completed' ? 'bg-green-100 text-green-700' : s.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{s.status}</Badge></td>
                            <td className="px-3 py-2"><Badge className={s.attendance === 'present' ? 'bg-green-100 text-green-700' : s.attendance === 'absent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>{s.attendance}</Badge></td>
                            <td className="px-3 py-2 truncate max-w-[160px]">{(s as any).studentId?.name || '-'}</td>
                            <td className="px-3 py-2 truncate max-w-[160px]">{(s as any).tutorId?.name || '-'}</td>
                            <td className="px-3 py-2 truncate max-w-[140px]">{(s as any).regularClassId?.subject || (s as any).subject || '-'}</td>
                            <td className="px-3 py-2 space-x-2">
                              {s.recordingUrl && (<a className="text-primary underline" target="_blank" href={s.recordingUrl}>Rec</a>)}
                              {s.notesUrl && (<a className="text-primary underline" target="_blank" href={s.notesUrl}>Notes</a>)}
                              {s.assignmentUrl && (<a className="text-primary underline" target="_blank" href={s.assignmentUrl}>Assign</a>)}
                            </td>
                          </tr>
                        ))}
                        {sessions.length === 0 && (
                          <tr><td className="px-3 py-10 text-center text-muted" colSpan={7}>No sessions</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden divide-y">
                    {sessions.length === 0 && (
                      <div className="px-3 py-10 text-center text-muted text-sm">No sessions</div>
                    )}
                    {sessions.map((s) => (
                      <div key={s._id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs">{s.startDateTime ? new Date(s.startDateTime).toLocaleString() : '-'}</div>
                          <Badge className={s.status === 'completed' ? 'bg-green-100 text-green-700' : s.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{s.status}</Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted">Student</span> {(s as any).studentId?.name || '-'}</div>
                          <div><span className="text-muted">Tutor</span> {(s as any).tutorId?.name || '-'}</div>
                          <div><span className="text-muted">Attendance</span> <Badge className={s.attendance === 'present' ? 'bg-green-100 text-green-700' : s.attendance === 'absent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>{s.attendance}</Badge></div>
                          <div><span className="text-muted">Subject</span> {(s as any).regularClassId?.subject || (s as any).subject || '-'}</div>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          {s.recordingUrl && (<a className="text-primary underline" target="_blank" href={s.recordingUrl}>Rec</a>)}
                          {s.notesUrl && (<a className="text-primary underline" target="_blank" href={s.notesUrl}>Notes</a>)}
                          {s.assignmentUrl && (<a className="text-primary underline" target="_blank" href={s.assignmentUrl}>Assign</a>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-xs text-muted">Total {total} • Page {page} of {pages}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => { setPage((p) => Math.max(1, p - 1)); }}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => { setPage((p) => Math.min(pages, p + 1)); }}>Next</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
