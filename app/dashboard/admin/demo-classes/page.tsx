'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle, Clock, Download, Eye, RefreshCw, Search, Trash2, XCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { acceptAdminDemoBooking, cancelAdminDemoBooking, deleteAdminDemoBooking, getAdminDemoBookings } from '@/services/adminService';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'expired', 'student-missed', 'tutor-missed'];

type Person = {
  userId?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  isProfileComplete?: boolean;
  profile?: Record<string, any> | null;
};

type DemoBooking = {
  _id: string;
  status: string;
  subject?: string;
  subjects?: string[];
  requestedBy?: 'student' | 'tutor';
  preferredDate?: string;
  preferredTime?: string;
  preferredEndTime?: string;
  createdAt?: string;
  updatedAt?: string;
  note?: string;
  expiryReason?: string | null;
  expiredAt?: string | null;
  meetingLink?: string;
  attendance?: string;
  studentJoinedAt?: string | null;
  tutorJoinedAt?: string | null;
  student?: Person | null;
  tutor?: Person | null;
  demoFeedback?: {
    overall?: number;
    likedTutor?: boolean;
    comment?: string;
    createdAt?: string;
  } | null;
};

const statusClass = (status: string) => {
  if (status === 'confirmed') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'completed') return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'pending') return 'bg-yellow-50 text-yellow-800 border-yellow-200';
  if (status === 'cancelled' || status === 'expired') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const statusLabel = (status: string) => {
  if (status === 'confirmed') return 'booked';
  return status;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const ageText = (value?: string) => {
  if (!value) return '-';
  const ms = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '-';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

const participantSummary = (person?: Person | null) => {
  const profile = person?.profile || {};
  const details = [
    profile.classLevel || profile.qualification,
    profile.board || profile.teachingMode,
    profile.city,
  ].filter(Boolean);
  return details.length ? details.join(' | ') : 'Profile details not filled';
};

const csvValue = (value: unknown) => {
  const text = String(value ?? '').replace(/\r?\n/g, ' ');
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCsv = (rows: DemoBooking[]) => {
  const headers = [
    'ID',
    'Status',
    'Requested By',
    'Subject',
    'Date',
    'Time',
    'Student',
    'Student Email',
    'Student Phone',
    'Tutor',
    'Tutor Email',
    'Tutor Phone',
    'Attendance',
    'Remark/Reason',
    'Expiry Reason',
    'Created At',
  ];
  const body = rows.map((booking) => [
    booking._id,
    statusLabel(booking.status),
    booking.requestedBy || 'student',
    booking.subject || (booking.subjects || []).join(', '),
    formatDate(booking.preferredDate),
    [booking.preferredTime || '', booking.preferredEndTime ? `to ${booking.preferredEndTime}` : ''].filter(Boolean).join(' '),
    booking.student?.name || '',
    booking.student?.email || '',
    booking.student?.phone || '',
    booking.tutor?.name || '',
    booking.tutor?.email || '',
    booking.tutor?.phone || '',
    booking.attendance || 'not-marked',
    booking.note || '',
    booking.expiryReason || '',
    formatDateTime(booking.createdAt),
  ]);
  const csv = [headers, ...body]
    .map((row) => row.map(csvValue).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `demo-classes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function AdminDemoClassesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [status, setStatus] = useState('pending');
  const [requestedBy, setRequestedBy] = useState<'all' | 'student' | 'tutor'>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const refresh = async (overrides?: Partial<{ page: number; q: string }>) => {
    const nextPage = overrides?.page ?? page;
    const nextQ = overrides?.q ?? q;
    setLoading(true);
    try {
      const res = await getAdminDemoBookings({
        status: status === 'all' ? undefined : status,
        requestedBy: requestedBy === 'all' ? undefined : requestedBy,
        q: nextQ.trim() || undefined,
        page: nextPage,
        limit,
      });
      setBookings(res.data || []);
      setTotal(res.pagination?.total || 0);
      setPages(res.pagination?.pages || 1);
    } catch (error: any) {
      toast({ title: 'Failed to load demo classes', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [status, requestedBy, page, limit]);

  useEffect(() => {
    const h = setTimeout(() => {
      setPage(1);
      refresh({ page: 1 });
    }, 350);
    return () => clearTimeout(h);
  }, [q]);

  const summary = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const stalePending = bookings.filter((b) => b.status === 'pending' && b.createdAt && Date.now() - new Date(b.createdAt).getTime() > 24 * 60 * 60 * 1000).length;
    return { pending, confirmed, stalePending };
  }, [bookings]);

  const cancelDemo = async (booking: DemoBooking) => {
    const reason = window.prompt('Reason for cancelling this demo class?', 'Cancelled by admin');
    if (reason === null) return;
    setCancellingId(booking._id);
    try {
      await cancelAdminDemoBooking(booking._id, reason.trim() || 'Cancelled by admin');
      toast({ title: 'Demo cancelled' });
      refresh();
    } catch (error: any) {
      toast({ title: 'Cancel failed', description: error.message, variant: 'destructive' });
    } finally {
      setCancellingId(null);
    }
  };

  const acceptDemo = async (booking: DemoBooking) => {
    setAcceptingId(booking._id);
    try {
      await acceptAdminDemoBooking(booking._id);
      toast({ title: 'Demo accepted' });
      refresh();
    } catch (error: any) {
      toast({ title: 'Accept failed', description: error.message, variant: 'destructive' });
    } finally {
      setAcceptingId(null);
    }
  };

  const deleteDemo = async (booking: DemoBooking) => {
    const ok = window.confirm(
      `Delete this demo class record for ${booking.subject || 'demo class'}? This cannot be undone.`,
    );
    if (!ok) return;
    setDeletingId(booking._id);
    try {
      await deleteAdminDemoBooking(booking._id);
      toast({ title: 'Demo deleted' });
      refresh();
    } catch (error: any) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const exportDemoRecords = async () => {
    setExporting(true);
    try {
      const res = await getAdminDemoBookings({
        status: status === 'all' ? undefined : status,
        requestedBy: requestedBy === 'all' ? undefined : requestedBy,
        q: q.trim() || undefined,
        page: 1,
        limit: Math.max(10000, total || 0),
      });
      const rows = res.data || [];
      if (!rows.length) {
        toast({ title: 'No records to export' });
        return;
      }
      downloadCsv(rows);
      toast({ title: 'Demo records exported', description: `${rows.length} records downloaded.` });
    } catch (error: any) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="admin" userName="Admin" />
        <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pr-64">
          <Topbar title="Demo Classes" subtitle="Track every demo request, acceptance state, participants, and pending response time" />

          <main className="p-4 lg:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="rounded-lg bg-white p-4 shadow-sm">
                <div className="text-xs text-muted">All demo requests</div>
                <div className="mt-1 text-2xl font-semibold text-text">{total}</div>
              </Card>
              <Card className="rounded-lg bg-white p-4 shadow-sm">
                <div className="text-xs text-muted">Pending for action</div>
                <div className="mt-1 text-2xl font-semibold text-yellow-700">{summary.pending}</div>
              </Card>
              <Card className="rounded-lg bg-white p-4 shadow-sm">
                <div className="text-xs text-muted">Pending over 24 hours</div>
                <div className="mt-1 text-2xl font-semibold text-red-700">{summary.stalePending}</div>
              </Card>
            </div>

            <Card className="rounded-lg bg-white p-3 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted" />
                  <input
                    className="h-9 w-full rounded-md border pl-8 pr-3 text-sm"
                    placeholder="Search student, tutor, subject, phone"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <select className="h-9 rounded-md border px-2 text-sm" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : statusLabel(s)}</option>)}
                </select>
                <select className="h-9 rounded-md border px-2 text-sm" value={requestedBy} onChange={(e) => { setPage(1); setRequestedBy(e.target.value as any); }}>
                  <option value="all">Any requester</option>
                  <option value="student">Student requested</option>
                  <option value="tutor">Tutor requested</option>
                </select>
                <select className="h-9 rounded-md border px-2 text-sm" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
                  <option value={10}>10 rows</option>
                  <option value={20}>20 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportDemoRecords} disabled={loading || exporting}>
                  <Download className="mr-2 h-4 w-4" /> {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </Card>

            <Card className="rounded-lg bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-text">Demo Requests</div>
                  <div className="text-xs text-muted">Pending age is counted from request creation until acceptance or cancellation.</div>
                </div>
                <Badge variant="outline">Page {page} of {Math.max(1, pages)}</Badge>
              </div>

              {loading ? (
                <div className="p-10 text-center text-sm text-muted">Loading demo requests...</div>
              ) : bookings.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted">No demo requests found.</div>
              ) : (
                <div className="divide-y">
                  {bookings.map((booking) => {
                    const canCancel = !['cancelled', 'completed', 'expired'].includes(booking.status);
                    const canAccept = booking.status === 'pending';
                    return (
                      <div key={booking._id} className="p-4 space-y-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-semibold text-text">{booking.subject || 'Demo class'}</h2>
                              <Badge className={`border ${statusClass(booking.status)}`}>{statusLabel(booking.status)}</Badge>
                              <Badge variant="outline">Requested by {booking.requestedBy || 'student'}</Badge>
                              {booking.status === 'pending' && (
                                <Badge className="border border-orange-200 bg-orange-50 text-orange-700">
                                  Pending {ageText(booking.createdAt)}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(booking.preferredDate)}</span>
                              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {booking.preferredTime || '-'}{booking.preferredEndTime ? ` to ${booking.preferredEndTime}` : ''}</span>
                              <span>Created {formatDateTime(booking.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {booking.meetingLink && (
                              <a href={booking.meetingLink} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm">Meeting</Button>
                              </a>
                            )}
                            {canAccept && (
                              <Button
                                size="sm"
                                onClick={() => acceptDemo(booking)}
                                disabled={acceptingId === booking._id || cancellingId === booking._id}
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {acceptingId === booking._id ? 'Accepting...' : 'Accept'}
                              </Button>
                            )}
                            {canCancel && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => cancelDemo(booking)}
                                disabled={cancellingId === booking._id || acceptingId === booking._id || deletingId === booking._id}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteDemo(booking)}
                              disabled={deletingId === booking._id || cancellingId === booking._id || acceptingId === booking._id}
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {deletingId === booking._id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                          {(['student', 'tutor'] as const).map((role) => {
                            const person = booking[role];
                            const id = person?.userId || person?._id;
                            return (
                              <div key={role} className="rounded-lg border p-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <div>
                                    <div className="text-xs uppercase text-muted">{role}</div>
                                    <div className="font-semibold text-text">{person?.name || 'Unknown'}</div>
                                  </div>
                                  {id && (
                                    <Link href={`/dashboard/admin/users/${id}`}>
                                      <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> Profile</Button>
                                    </Link>
                                  )}
                                </div>
                                <div className="space-y-1 text-sm text-muted">
                                  <div>Email: {person?.email || '-'}</div>
                                  <div>Phone: {person?.phone || '-'}</div>
                                  <div>Status: {person?.status || '-'} | Profile: {person?.isProfileComplete ? 'complete' : 'incomplete'}</div>
                                  <div>{participantSummary(person)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm text-muted lg:grid-cols-3">
                          <div className="rounded-lg bg-gray-50 p-3">Attendance: {booking.attendance || 'not-marked'}</div>
                          <div className="rounded-lg bg-gray-50 p-3">Student joined: {formatDateTime(booking.studentJoinedAt)}</div>
                          <div className="rounded-lg bg-gray-50 p-3">Tutor joined: {formatDateTime(booking.tutorJoinedAt)}</div>
                        </div>

                        {(booking.note || booking.expiryReason || booking.demoFeedback) && (
                          <div className="rounded-lg border bg-gray-50 p-3 text-sm text-muted">
                            {booking.note && <div><span className="font-medium text-text">Remark/Reason:</span> {booking.note}</div>}
                            {booking.expiryReason && <div><span className="font-medium text-text">Expiry:</span> {booking.expiryReason} at {formatDateTime(booking.expiredAt)}</div>}
                            {booking.demoFeedback && (
                              <div>
                                <span className="font-medium text-text">Feedback:</span> {booking.demoFeedback.overall || '-'} / 5, {booking.demoFeedback.likedTutor ? 'liked tutor' : 'did not proceed'}{booking.demoFeedback.comment ? ` - ${booking.demoFeedback.comment}` : ''}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between border-t px-4 py-3">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <div className="text-xs text-muted">{total} total demos</div>
                <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}


