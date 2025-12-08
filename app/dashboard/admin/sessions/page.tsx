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

  const refresh = () => {
    setLoading(true);
    api
      .get('/admin/sessions', { params: { status } })
      .then((res) => setSessions(res.data?.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, [status]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={3} userRole="admin" userName="Admin" />
        <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64">
          <Topbar title="Sessions" subtitle="Monitor attendance and resources" />

          <main className="p-4 lg:p-6 space-y-6">
            <Card className="p-4 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <select className="h-10 rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline" onClick={refresh}>Refresh</Button>
                <Link href="/dashboard/admin/revenue"><Button variant="outline">Revenue</Button></Link>
              </div>
            </Card>

            <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-muted">Loading sessions...</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wider text-muted">
                      <th className="px-4 py-3">Start Time</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Attendance</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Resources</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s._id} className="border-t">
                        <td className="px-4 py-4">{new Date(s.startDateTime).toLocaleString()}</td>
                        <td className="px-4 py-4 capitalize">{s.status}</td>
                        <td className="px-4 py-4 capitalize">{s.attendance}</td>
                        <td className="px-4 py-4">{s.regularClassId?.subject || '-'}</td>
                        <td className="px-4 py-4 space-x-2">
                          {s.recordingUrl && (<a className="text-primary underline" target="_blank" href={s.recordingUrl}>Recording</a>)}
                          {s.notesUrl && (<a className="text-primary underline" target="_blank" href={s.notesUrl}>Notes</a>)}
                          {s.assignmentUrl && (<a className="text-primary underline" target="_blank" href={s.assignmentUrl}>Assignment</a>)}
                        </td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr><td className="px-4 py-12 text-center text-muted" colSpan={5}>No sessions</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
