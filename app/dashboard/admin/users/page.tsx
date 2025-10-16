'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Search as SearchIcon, ToggleLeft, ToggleRight, UserX } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye } from "lucide-react";
import { cn } from '@/lib/utils';

type Role = 'student' | 'tutor' | 'admin';
type Status = 'active' | 'suspended';

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: Status;
  createdAt: string; // ISO
  lastActive: string; // ISO
};

const MOCK_USERS: UserRow[] = [
  {
    id: 'u_1001',
    name: 'Rohit Kumar',
    email: 'rohit@example.com',
    phone: '+91 98765 12345',
    role: 'student',
    status: 'active',
    createdAt: '2025-08-12',
    lastActive: '2025-10-12T14:20:00Z',
  },
  {
    id: 'u_1002',
    name: 'Priya Iyer',
    email: 'priya@example.com',
    phone: '+91 99888 77665',
    role: 'tutor',
    status: 'suspended',
    createdAt: '2025-07-01',
    lastActive: '2025-09-30T09:00:00Z',
  },
  {
    id: 'u_1003',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-15',
    lastActive: '2025-10-13T04:00:00Z',
  },
];

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // filters
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [sort, setSort] = useState<'createdAt_desc' | 'createdAt_asc' | 'lastActive_desc' | 'lastActive_asc'>('createdAt_desc');

  // local state to simulate actions
  const [rows, setRows] = useState<UserRow[]>(MOCK_USERS);

  const filtered = useMemo(() => {
    let data = [...rows];

    // search
    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone ?? '').toLowerCase().includes(q)
      );
    }
    // role
    if (role !== 'all') data = data.filter(r => r.role === role);
    // status
    if (status !== 'all') data = data.filter(r => r.status === status);
    // sort
    data.sort((a, b) => {
      const dA = sort.startsWith('createdAt') ? a.createdAt : a.lastActive;
      const dB = sort.startsWith('createdAt') ? b.createdAt : b.lastActive;
      const cmp = new Date(dA).getTime() - new Date(dB).getTime();
      return sort.endsWith('_asc') ? cmp : -cmp;
    });

    return data;
  }, [rows, query, role, status, sort]);

  function toggleStatus(id: string) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status: r.status === 'active' ? 'suspended' : 'active' } : r)));
  }

  function sendReset(id: string) {
    const user = rows.find(r => r.id === id);
    alert(`Password reset link sent to ${user?.email}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={2} userRole="admin" userName="Admin" />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title="Users"
          subtitle="Manage students, tutors and admins"
          greeting
          action={
            <Link href="/admin/analytics">
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
                  placeholder="Search name, email, phone"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select className="h-10 rounded-md border px-3 text-sm" value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="admin">Admin</option>
              </select>

              <select className="h-10 rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <select className="h-10 rounded-md border px-3 text-sm" value={sort} onChange={(e) => setSort(e.target.value as any)}>
                <option value="createdAt_desc">Newest signup</option>
                <option value="createdAt_asc">Oldest signup</option>
                <option value="lastActive_desc">Last active (newest)</option>
                <option value="lastActive_asc">Last active (oldest)</option>
              </select>
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sign Up</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-text">{u.name}</div>
                          <div className="text-muted text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{u.phone ?? '-'}</td>
                    <td className="px-4 py-4 capitalize">{u.role}</td>
                    <td className="px-4 py-4">
                      <Badge className={cn(
                        'border',
                        u.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'
                      )}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">{new Date(u.lastActive).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/profile/${u.id}`}><Button variant="outline" size="sm"> <Eye className="h-4 w-4" /></Button></Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Toggle status for ${u.name}?`)) toggleStatus(u.id);
                          }}
                        >
                          {u.status === 'active' ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                          {/* {u.status === 'active' ? 'Suspend' : 'Activate'} */}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => sendReset(u.id)}>
                          <UserX className="w-4 h-4 mr-2" />
                          Reset Password
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted">
                      No users found. Try clearing filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </main>
      </div>
    </div>
  );
}
