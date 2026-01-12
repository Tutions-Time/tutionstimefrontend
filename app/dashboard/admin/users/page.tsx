'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search as SearchIcon,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getAllUsers, getUserById, updateUserStatus } from '@/services/adminService';

type Role = 'student' | 'tutor' | 'admin';
type Status = 'active' | 'inactive' | 'suspended';

type UserRow = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: Role;
  status: Status;
  isProfileComplete?: boolean;
  createdAt: string;
  lastLogin: string;
  profilePhoto?: string;
  referralCode?: string | null;
  referralCodeUsed?: string | null;
  referrerUserId?: string | null;
  referrerName?: string | null;
  referrerRole?: Role | null;
};

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [sort, setSort] = useState<
    'createdAt_desc' | 'createdAt_asc' | 'lastActive_desc' | 'lastActive_asc'
  >('createdAt_desc');

  // Data
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const pages = useMemo(() => (total && limit ? Math.ceil(total / limit) : 1), [total, limit]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileReferralCode, setProfileReferralCode] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  // Fetch users from backend (server-side filters/pagination)
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await getAllUsers({
          page,
          limit,
          role: 'student',
          status: status === 'all' ? undefined : (status as Status),
          q: query,
          sort,
        });

        const users = res?.users || [];
        const pag = res?.pagination || {} as any;
        if (res.success && Array.isArray(users)) {
          setRows(users);
          setTotal(Number(pag.total || users.length));
        } else {
          toast({
            title: 'Failed to load students',
            description: 'Unexpected response format',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error loading students',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [page, limit, status, query, sort]);

  // Image URL helper
  const imgSrc = (url?: string) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const formatText = (value?: string | null) => (value ? String(value) : 'N/A');
  const formatList = (value?: string[] | null) =>
    value && value.length ? value.join(', ') : 'N/A';

  const normalizeUserResponse = (res: any) => {
    if (!res) return { user: null, profile: null };
    if (res.data && (res.data.user || res.data.profile)) {
      return { user: res.data.user || null, profile: res.data.profile || null };
    }
    if (res.user || res.profile) return { user: res.user || null, profile: res.profile || null };
    return { user: res, profile: null };
  };

  const openProfileModal = async (user: UserRow) => {
    setSelectedUser(user);
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileUser(null);
    setProfileData(null);
    try {
      const res = await getUserById(user._id);
      const normalized = normalizeUserResponse(res);
      setProfileUser(normalized.user);
      setProfileData(normalized.profile);
      setProfileReferralCode(res?.referralCode || null);
    } catch (error: any) {
      toast({
        title: 'Failed to load student profile',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileOpenChange = (open: boolean) => {
    setProfileOpen(open);
    if (!open) {
      setSelectedUser(null);
      setProfileUser(null);
      setProfileData(null);
      setProfileReferralCode(null);
      setProfileLoading(false);
    }
  };

  // ✅ Toggle active/inactive status
  async function handleToggleStatus(id: string, currentStatus: Status) {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const updatedUser = await updateUserStatus(id, newStatus);

      setRows((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: updatedUser.status } : r
        )
      );

      toast({
        title: `User ${
          updatedUser.status === 'active' ? 'activated' : 'deactivated'
        } successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update user status',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={2}
        userRole="admin"
        userName="Admin"
      />
      <Sidebar
        userRole="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="Students"
          subtitle="Manage students"
          greeting
          action={
            <Link href="/dashboard/admin/">
              <Button className="bg-primary hover:bg-primary/90 text-text">
                <Users className="w-4 h-4 mr-2" />
                Go to Analytics
              </Button>
            </Link>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Filters */}
          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <Input
                  placeholder="Search name, email, or phone"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
              >
                <option value="createdAt_desc">Newest signup</option>
                <option value="createdAt_asc">Oldest signup</option>
                <option value="lastActive_desc">Last active (newest)</option>
                <option value="lastActive_asc">Last active (oldest)</option>
              </select>
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-muted">Loading students...</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 hidden md:table-cell">Role</th>
                    <th className="px-4 py-3 hidden md:table-cell">Profile</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Referral</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Referral Used</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Referrer</th>
                    <th className="px-4 py-3">Status</th>
                    {/* <th className="px-4 py-3 hidden md:table-cell">Sign Up</th>
                    <th className="px-4 py-3 hidden md:table-cell">Last Login</th> */}
                    <th className="px-4 py-3 hidden sm:table-cell text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {u.profilePhoto ? (
                            <img
                              src={imgSrc(u.profilePhoto)}
                              alt={u.name || 'User'}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                              {u.name
                                ? u.name.charAt(0).toUpperCase()
                                : u.role.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-text">
                              {u.name || 'N/A'}
                            </div>
                            <div className="text-muted text-xs">
                              {u.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{u.phone || '—'}</td>
                      <td className="px-4 py-4 capitalize hidden md:table-cell">{u.role}</td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {u.isProfileComplete ? (
                          <Badge className="bg-success/10 text-success border-success/20 border">
                            Complete
                          </Badge>
                        ) : (
                          <Badge className="bg-danger/10 text-danger border-danger/20 border">
                            Incomplete
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">{u.referralCode || '—'}</td>
                      <td className="px-4 py-4 hidden lg:table-cell">{u.referralCodeUsed || '—'}</td>
                      <td className="px-4 py-4 hidden lg:table-cell">{u.referrerName ? `${u.referrerName} (${u.referrerRole})` : '—'}</td>
                      <td className="px-4 py-4">
                        <Badge
                          className={cn(
                            'border',
                            u.status === 'active'
                              ? 'bg-success/10 text-success border-success/20'
                              : 'bg-danger/10 text-danger border-danger/20'
                          )}
                        >
                          {u.status}
                        </Badge>
                      </td>
                      {/* <td className="px-4 py-4 hidden md:table-cell">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {new Date(u.lastLogin).toLocaleString()}
                      </td> */}
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProfileModal(u)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(u._id, u.status)
                            }
                          >
                            {u.status === 'active' ? (
                              <ToggleLeft className="w-4 h-4 mr-2" />
                            ) : (
                              <ToggleRight className="w-4 h-4 mr-2" />
                            )}
                            
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-4 py-12 text-center text-muted"
                      >
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted">Page {page} of {pages} • {total} users</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
              <select className="h-9 rounded-md border px-2 text-sm" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={profileOpen} onOpenChange={handleProfileOpenChange}>
        <DialogContent className="max-w-4xl rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>Full profile details</DialogDescription>
          </DialogHeader>

          {profileLoading ? (
            <div className="py-10 text-center text-muted">Loading student profile...</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {imgSrc(profileData?.photoUrl || profileUser?.photoUrl || selectedUser?.profilePhoto) ? (
                  <img
                    src={imgSrc(profileData?.photoUrl || profileUser?.photoUrl || selectedUser?.profilePhoto)}
                    alt={profileData?.name || profileUser?.name || selectedUser?.name || 'Student'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                    {(profileData?.name || profileUser?.name || selectedUser?.name || 'S')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xl font-semibold">
                    {formatText(profileData?.name || profileUser?.name || selectedUser?.name)}
                  </div>
                  <div className="text-sm text-muted">
                    {formatText(profileData?.email || profileUser?.email || selectedUser?.email)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-base font-semibold mb-3">Referral</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Referral Code</div>
                    <div>{formatText(profileReferralCode || selectedUser?.referralCode)}</div>
                  </div>
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
                    <div>{formatText(profileData?.email)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Alternate Phone</div>
                    <div>{formatText(profileData?.altPhone)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Address Line 1</div>
                    <div>{formatText(profileData?.addressLine1)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Address Line 2</div>
                    <div>{formatText(profileData?.addressLine2)}</div>
                  </div>
                  <div>
                    <div className="text-muted">State</div>
                    <div>{formatText(profileData?.state)}</div>
                  </div>
                  <div>
                    <div className="text-muted">City</div>
                    <div>{formatText(profileData?.city)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Pincode</div>
                    <div>{formatText(profileData?.pincode)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Gender</div>
                    <div>{formatText(profileData?.gender || profileData?.genderOther)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Learning Mode</div>
                    <div>{formatText(profileData?.learningMode)}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-base font-semibold mb-3">Academic Details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Learning Track</div>
                    <div>{formatText(profileData?.track)}</div>
                  </div>
                  {profileData?.track === 'school' && (
                    <>
                      <div>
                        <div className="text-muted">Education Board</div>
                        <div>{formatText(profileData?.boardOther || profileData?.board)}</div>
                      </div>
                      <div>
                        <div className="text-muted">Class</div>
                        <div>{formatText(profileData?.classLevelOther || profileData?.classLevel)}</div>
                      </div>
                      {['Class 11', 'Class 12'].includes(profileData?.classLevel) && (
                        <div>
                          <div className="text-muted">Stream</div>
                          <div>{formatText(profileData?.streamOther || profileData?.stream)}</div>
                        </div>
                      )}
                    </>
                  )}
                  {profileData?.track === 'college' && (
                    <>
                      <div>
                        <div className="text-muted">Program</div>
                        <div>{formatText(profileData?.programOther || profileData?.program)}</div>
                      </div>
                      <div>
                        <div className="text-muted">Discipline</div>
                        <div>{formatText(profileData?.disciplineOther || profileData?.discipline)}</div>
                      </div>
                      <div>
                        <div className="text-muted">Year / Semester</div>
                        <div>{formatText(profileData?.yearSemOther || profileData?.yearSem)}</div>
                      </div>
                    </>
                  )}
                  {profileData?.track === 'competitive' && (
                    <>
                      <div>
                        <div className="text-muted">Exam</div>
                        <div>{formatText(profileData?.examOther || profileData?.exam)}</div>
                      </div>
                      <div>
                        <div className="text-muted">Target Year</div>
                        <div>{formatText(profileData?.targetYearOther || profileData?.targetYear)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-base font-semibold mb-3">Preferred Subjects</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Subjects</div>
                    <div>{formatList(profileData?.subjects)}</div>
                  </div>
                  {profileData?.subjectOther ? (
                    <div>
                      <div className="text-muted">Other Subject</div>
                      <div>{formatText(profileData?.subjectOther)}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-base font-semibold mb-3">Tutor Preferences</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Preferred Tutor Gender</div>
                    <div>{formatText(profileData?.tutorGenderPref || profileData?.tutorGenderOther)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Preferred Time Slots</div>
                    <div>{formatList(profileData?.preferredTimes)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Learning Goals</div>
                    <div>{formatText(profileData?.goals)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Availability</div>
                    <div>{formatList(profileData?.availability)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
