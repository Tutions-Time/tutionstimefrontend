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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AvailabilityPicker from '@/components/forms/AvailabilityPicker';
import { getUserById } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

type LiveSession = {
  _id: string;
  kind: 'regular' | 'group';
  subject: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: string;
  isLive?: boolean;
  meetingLink?: string;
  tutor?: { _id?: string; userId?: string; name?: string; photoUrl?: string } | null;
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
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
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
  const [range, setRange] = useState<'next7' | 'today' | 'last7' | 'custom'>('next7');
  const [from, setFrom] = useState<string>(() => toDateInput(new Date()));
  const [to, setTo] = useState<string>(() => toDateInput(addDays(new Date(), 7)));
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [summary, setSummary] = useState<{
    isInClass: boolean;
    count: number;
    liveCount: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<{ userId?: string; name?: string; photoUrl?: string } | null>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  const refresh = async (overrides?: Partial<{
    student: string;
    tutor: string;
    kind: 'all' | 'group' | 'regular';
    status: 'all' | 'scheduled' | 'completed' | 'cancelled' | 'expired';
    isLive: 'all' | 'true' | 'false';
    from: string;
    to: string;
    page: number;
    limit: number;
  }>) => {
    const qStudent = overrides?.student ?? student;
    const qTutor = overrides?.tutor ?? tutor;
    const qKind = overrides?.kind ?? kind;
    const qStatus = overrides?.status ?? status;
    const qIsLive = overrides?.isLive ?? isLive;
    const qFrom = overrides?.from ?? from;
    const qTo = overrides?.to ?? to;
    const qPage = overrides?.page ?? page;
    const qLimit = overrides?.limit ?? limit;
    setLoading(true);
    try {
      const res = await getClassesMonitor({
        student: qStudent.trim() || undefined,
        tutor: qTutor.trim() || undefined,
        kind: qKind === 'all' ? undefined : qKind,
        status: qStatus === 'all' ? undefined : qStatus,
        isLive: qIsLive === 'all' ? undefined : qIsLive,
        from: qFrom || undefined,
        to: qTo || undefined,
        page: qPage,
        limit: qLimit,
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
    const today = new Date();
    if (range === 'today') {
      const f = toDateInput(today);
      setFrom(f);
      setTo(f);
    } else if (range === 'next7') {
      setFrom(toDateInput(today));
      setTo(toDateInput(addDays(today, 7)));
    } else if (range === 'last7') {
      setFrom(toDateInput(addDays(today, -7)));
      setTo(toDateInput(today));
    }
    // 'custom' leaves current from/to intact
  }, [range]);

  useEffect(() => {
    const h = setTimeout(() => {
      setPage(1);
      refresh({ page: 1 });
    }, 400);
    return () => clearTimeout(h);
  }, [student, tutor]);

  const rows = useMemo(() => sessions, [sessions]);

  const getProperImageUrl = (path?: string | null) => {
    if (!path) return '';
    const p = String(path);
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    const cleaned = p.replace(/^[A-Za-z]:\\.*?uploads\\/i, 'uploads/').replace(/\\/g, '/');
    const base =
      process.env.NEXT_PUBLIC_IMAGE_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
      '';
    const trimmed = cleaned.replace(/^\/+/, '');
    return base ? `${base}/${trimmed}` : cleaned;
  };
  const formatText = (v: any) => {
    if (v === null || v === undefined) return '-';
    const s = String(v).trim();
    return s.length ? s : '-';
  };
  const formatArray = (arr: any) => {
    if (!Array.isArray(arr) || arr.length === 0) return '-';
    const parts = arr.map((x) => (typeof x === 'string' ? x : String(x))).filter(Boolean);
    return parts.length ? parts.join(', ') : '-';
  };

  const openTutorModal = async (t: { userId?: string; name?: string; photoUrl?: string }) => {
    if (!t?.userId) {
      toast({ title: 'Tutor detail not available', description: 'User id missing for this tutor', variant: 'destructive' });
      return;
    }
    setSelectedTutor({ userId: t.userId, name: t.name, photoUrl: t.photoUrl });
    setTutorOpen(true);
    setTutorLoading(true);
    setProfileUser(null);
    setProfileData(null);
    try {
      const res = await getUserById(String(t.userId));
      const user = res?.user || res?.data?.user || res || null;
      const profile = res?.profile || res?.data?.profile || null;
      setProfileUser(user);
      setProfileData(profile);
    } catch (err: any) {
      toast({ title: 'Failed to load tutor', description: err.message, variant: 'destructive' });
    } finally {
      setTutorLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={3} userRole="admin" userName="Admin" />
        <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pr-64">
          <Topbar title="Classes Monitor" subtitle="All classes: group + 1:1, with live status" />

          <main className="p-4 lg:p-6 space-y-6">
            <Card className="p-3 rounded-2xl bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-8 gap-2 items-center">
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
                  value={range}
                  onChange={(e) => setRange(e.target.value as any)}
                >
                  <option value="next7">Next 7 Days</option>
                  <option value="today">Today</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="custom">Custom Range</option>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void refresh();
                  }}
                  className="h-9"
                >
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
                          {s.tutor?.userId && (
                            <div>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => openTutorModal(s.tutor!)}
                                className="p-0 h-auto"
                              >
                                View Tutor Detail
                              </Button>
                            </div>
                          )}
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
      <Dialog open={tutorOpen} onOpenChange={(o) => {
        setTutorOpen(o);
        if (!o) {
          setSelectedTutor(null);
          setProfileUser(null);
          setProfileData(null);
          setTutorLoading(false);
        }
      }}>
        <DialogContent className="max-w-5xl rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tutor Profile</DialogTitle>
            <DialogDescription>Full profile details</DialogDescription>
          </DialogHeader>
          {tutorLoading ? (
            <div className="py-10 text-center text-muted">Loading tutor profile...</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {getProperImageUrl(profileData?.photoUrl || selectedTutor?.photoUrl) ? (
                  <img
                    src={getProperImageUrl(profileData?.photoUrl || selectedTutor?.photoUrl)}
                    alt={profileData?.name || selectedTutor?.name || 'Tutor'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                    {(profileData?.name || selectedTutor?.name || 'T').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xl font-semibold">{formatText(profileData?.name || selectedTutor?.name)}</div>
                  <div className="text-sm text-muted">{formatText(profileData?.email || profileUser?.email)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-base font-semibold mb-3">Personal Information</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Full Name</div>
                    <div>{formatText(profileData?.name)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Email</div>
                    <div>{formatText(profileData?.email || profileUser?.email)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Gender</div>
                    <div>{formatText(profileData?.gender)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Teaching Mode</div>
                    <div>{formatText(profileData?.teachingMode)}</div>
                  </div>
                  <div>
                    <div className="text-muted">City</div>
                    <div>{formatText(profileData?.city)}</div>
                  </div>
                  <div>
                    <div className="text-muted">State</div>
                    <div>{formatText(profileData?.state)}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-base font-semibold mb-3">Academic & Teaching</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Highest Qualification</div>
                    <div>{formatText(profileData?.qualification)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Specialization</div>
                    <div>{formatText(profileData?.specialization)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Experience (Years)</div>
                    <div>{formatText(profileData?.experience)}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-base font-semibold mb-3">Subjects & Classes</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Student Types</div>
                    <div>{formatArray(profileData?.studentTypes)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Subjects</div>
                    <div>{formatArray(profileData?.subjects)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Classes</div>
                    <div>{formatArray(profileData?.classLevels)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Boards / Curriculums</div>
                    <div>{formatArray(profileData?.boards)}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-base font-semibold mb-3">Rates & Availability</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Hourly Rate/per student</div>
                    <div>{formatText(profileData?.hourlyRate)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Monthly Rate/per student</div>
                    <div>{formatText(profileData?.monthlyRate)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-muted mb-2">Availability</div>
                    <AvailabilityPicker value={profileData?.availability || []} onChange={() => {}} readOnly />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

