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
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getAllUsers, updateUserStatus } from '@/services/adminService';

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
};

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [sort, setSort] = useState<
    'createdAt_desc' | 'createdAt_asc' | 'lastActive_desc' | 'lastActive_asc'
  >('createdAt_desc');

  // Data
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllUsers();

        const users = res?.users || [];

        if (res.success && Array.isArray(users)) {
          setRows(users);
          toast({ title: 'Users loaded successfully ' });
        } else {
          toast({
            title: 'Failed to load users',
            description: 'Unexpected response format',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error loading users',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter + sort logic
  const filtered = useMemo(() => {
    let data = [...rows];

    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q)
      );
    }

    if (role !== 'all') data = data.filter((r) => r.role === role);
    if (status !== 'all') data = data.filter((r) => r.status === status);

    data.sort((a, b) => {
      const dA = sort.startsWith('createdAt') ? a.createdAt : a.lastLogin;
      const dB = sort.startsWith('createdAt') ? b.createdAt : b.lastLogin;
      const cmp = new Date(dA).getTime() - new Date(dB).getTime();
      return sort.endsWith('_asc') ? cmp : -cmp;
    });

    return data;
  }, [rows, query, role, status, sort]);

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
          title="Users"
          subtitle="Manage students, tutors and admins"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="admin">Admin</option>
              </select>

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
              <div className="p-12 text-center text-muted">Loading users...</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Profile</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Sign Up</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {u.profilePhoto ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace(
                                '/api',
                                ''
                              )}/${u.profilePhoto}`}
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
                      <td className="px-4 py-4 capitalize">{u.role}</td>
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        {new Date(u.lastLogin).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {/* <Link href={`/dashboard/admin/users/${u._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link> */}
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
                            {/* {u.status === 'active' ? 'Deactivate' : 'Activate'} */}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-muted"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
