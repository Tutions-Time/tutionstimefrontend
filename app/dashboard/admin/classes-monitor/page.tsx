'use client';

import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getClassesMonitor } from '@/services/adminService';

type LiveSession = {
  _id: string;
  kind: 'regular' | 'group';
  subject: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: string;
  isLive?: boolean;
  meetingLink?: string;
  tutor?: { name?: string } | null;
  student?: { name?: string } | null;
  enrolled?: { _id: string; name?: string }[];
  presence?: {
    tutorJoined?: boolean;
    studentJoined?: boolean;
    tutorJoinTime?: string | null;
    studentJoinTime?: string | null;
  };
};

const toDateInput = (d: Date) => d.toISOString().split('T')[0];
const formatTimeRaw = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
};

export default function AdminClassesMonitorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState('');
  const [tutor, setTutor] = useState('');
  const [kind, setKind] = useState<'all' | 'group' | 'regular'>('all');
  const [status, setStatus] = useState<
    'all' | 'scheduled' | 'completed' | 'cancelled' | 'expired'
  >('all');
  const [isLive, setIsLive] = useState<'all' | 'true' | 'false'>('all');
  const [from, setFrom] = useState<string>(() => toDateInput(new Date()));
  const [to, setTo] = useState<string>(() => toDateInput(new Date()));
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [summary, setSummary] = useState<{
    isInClass: boolean;
    count: number;
    liveCount: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await getClassesMonitor({
        student: student.trim() || undefined,
        tutor: tutor.trim() || undefined,
        kind: kind === 'all' ? undefined : kind,
        status: status === 'all' ? undefined : status,
        isLive: isLive === 'all' ? undefined : isLive,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
        page,
        limit,
      });
      setSessions(res.data || []);
      setSummary(res.summary || null);
      const p = res.pagination;
      if (p) {
        setPages(p.pages || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [kind, status, isLive, from, to, page, limit]);

  useEffect(() => {
    const h = setTimeout(() => {
      setPage(1);
      refresh();
    }, 400);
    return () => clearTimeout(h);
  }, [student, tutor]);

  const rows = useMemo(() => sessions, [sessions]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={3} userRole="admin" userName="Admin" />
        <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64">
          <Topbar title="Classes Monitor" subtitle="All classes: group + 1:1, with live status" />

          <main className="p-4 lg:p-6 space-y-6">
            <Card className="p-3 rounded-2xl bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
                <select
                  className="h-9 rounded-md border px-2 text-xs"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as any)}
                >
                  <option value="all">All Types</option>
                  <option value="regular">Regular</option>
                  <option value="group">Group</option>
                </select>
                <select
                  className="h-9 rounded-md border px-2 text-xs"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  className="h-9 rounded-md border px-2 text-xs"
                  value={isLive}
                  onChange={(e) => setIsLive(e.target.value as any)}
                >
                  <option value="all">Live: All</option>
                  <option value="true">Live Only</option>
                  <option value="false">Not Live</option>
                </select>
                <input
                  type="date"
                  className="h-9 rounded-md border px-2 text-xs"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
                <input
                  type="date"
                  className="h-9 rounded-md border px-2 text-xs"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
                <input
                  className="h-9 rounded-md border px-2 text-xs"
                  placeholder="Student name / id"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                />
                <input
                  className="h-9 rounded-md border px-2 text-xs"
                  placeholder="Tutor name / id"
                  value={tutor}
                  onChange={(e) => setTutor(e.target.value)}
                />
                <select
                  className="h-9 rounded-md border px-2 text-xs"
                  value={limit}
                  onChange={(e) => {
                    setPage(1);
                    setLimit(Number(e.target.value));
                  }}
                >
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
                <Button size="sm" variant="outline" onClick={refresh} className="h-9">
                  Refresh
                </Button>
              </div>
            </Card>

            <Card className="rounded-2xl bg-white shadow-sm">
              {loading ? (
                <div className="p-10 text-center text-muted text-sm">Loading classes...</div>
              ) : rows.length === 0 ? (
                <div className="p-10 text-center text-muted text-sm">No classes found.</div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="text-xs text-muted">
                      Total {summary?.count ?? rows.length} | Live {summary?.liveCount ?? 0}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </Button>
                      <span>
                        Page {page} / {pages}
                      </span> 
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page >= pages}
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    {rows.map((s) => (
                      <div
                        key={s._id}
                        className="flex items-start justify-between border rounded-lg px-3 py-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {s.subject || 'Class'}{' '}
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              {s.kind === 'group' ? 'Group' : 'Regular'}
                            </Badge>
                            {s.isLive && (
                              <Badge className="ml-2 bg-green-100 text-green-700 text-[10px]">Live</Badge>
                            )}
                          </div>
                          <div className="text-muted">
                            Time:{' '}
                            {formatTimeRaw(s.startDateTime)}{' '}
                            -{' '}
                            {formatTimeRaw(s.endDateTime)}
                          </div>
                          <div className="text-muted">Tutor: {s.tutor?.name || '-'}</div>
                          {s.kind === 'group' ? (
                            <details className="text-muted">
                              <summary className="cursor-pointer">
                                Students: {(s.enrolled || []).length || 0}
                              </summary>
                              <div className="mt-1 space-y-1">
                                {(s.enrolled || []).map((st) => (
                                  <div key={st._id}>{st.name || st._id}</div>
                                ))}
                              </div>
                            </details>
                          ) : (
                            <div className="text-muted">Student: {s.student?.name || '-'}</div>
                          )}
                          {s.presence && (
                            <div className="text-muted">
                              Tutor joined: {s.presence.tutorJoined ? 'Yes' : 'No'} | Student joined:{' '}
                              {s.presence.studentJoined ? 'Yes' : 'No'}
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
                            {s.status || 'scheduled'}
                          </Badge>
                          {s.meetingLink && (
                            <a className="text-primary underline" target="_blank" href={s.meetingLink}>
                              Join link
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
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
