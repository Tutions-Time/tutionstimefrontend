'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, CheckCircle, XCircle, ShieldCheck, Search as SearchIcon, ToggleLeft, ToggleRight, Star } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Status = 'active' | 'suspended';
type Kyc = 'pending' | 'approved' | 'rejected';

type TutorRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  kyc: Kyc;
  rating: number; // 0..5
  classes30d: number;
  earnings30d: number; // INR
  status: Status;
  joinedAt: string; // ISO
};

const MOCK_TUTORS: TutorRow[] = [
  {
    id: 't_1001',
    name: 'Ankit Sharma',
    email: 'ankit@tutors.com',
    phone: '+91 99876 55443',
    kyc: 'pending',
    rating: 4.6,
    classes30d: 22,
    earnings30d: 38500,
    status: 'active',
    joinedAt: '2025-03-02',
  },
  {
    id: 't_1002',
    name: 'Meera Iyer',
    email: 'meera@tutors.com',
    phone: '+91 98700 11223',
    kyc: 'approved',
    rating: 4.9,
    classes30d: 40,
    earnings30d: 71200,
    status: 'active',
    joinedAt: '2024-12-10',
  },
  {
    id: 't_1003',
    name: 'Vikas Gupta',
    email: 'vikas@tutors.com',
    phone: '+91 90000 88811',
    kyc: 'rejected',
    rating: 3.8,
    classes30d: 6,
    earnings30d: 8200,
    status: 'suspended',
    joinedAt: '2025-07-21',
  },
];

export default function AdminTutorsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [kyc, setKyc] = useState<Kyc | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [minRating, setMinRating] = useState<number>(0);

  const [rows, setRows] = useState<TutorRow[]>(MOCK_TUTORS);

  const filtered = useMemo(() => {
    let data = [...rows];

    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.phone ?? '').toLowerCase().includes(q));
    }
    if (kyc !== 'all') data = data.filter(r => r.kyc === kyc);
    if (status !== 'all') data = data.filter(r => r.status === status);
    if (minRating > 0) data = data.filter(r => r.rating >= minRating);

    return data;
  }, [rows, query, kyc, status, minRating]);

  function setKycStatus(id: string, newStatus: Kyc) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, kyc: newStatus } : r)));
  }

  function toggleStatus(id: string) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status: r.status === 'active' ? 'suspended' : 'active' } : r)));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={3} userRole="admin" userName="Admin" />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title="Tutors"
          subtitle="KYC, performance, and controls"
          greeting
          action={
            <Link href="/admin/analytics">
              <Button className="bg-primary hover:bg-primary/90 text-text">
                <Users className="w-4 h-4 mr-2" />
                Platform Overview
              </Button>
            </Link>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Filters */}
          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <Input placeholder="Search name, email, phone" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>

              <select className="h-10 rounded-md border px-3 text-sm" value={kyc} onChange={(e) => setKyc(e.target.value as any)}>
                <option value="all">All KYC</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select className="h-10 rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" />
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  placeholder="Min rating"
                />
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Tutor</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">KYC</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Classes (30d)</th>
                  <th className="px-4 py-3">Earnings (30d)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                          {t.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-text">{t.name}</div>
                          <div className="text-muted text-xs">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{t.phone ?? '-'}</td>
                    <td className="px-4 py-4">
                      <Badge className={cn(
                        'border capitalize',
                        t.kyc === 'approved' ? 'bg-success/10 text-success border-success/20' :
                        t.kyc === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-danger/10 text-danger border-danger/20'
                      )}>
                        {t.kyc}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">{t.rating.toFixed(1)}</td>
                    <td className="px-4 py-4">{t.classes30d}</td>
                    <td className="px-4 py-4">₹{t.earnings30d.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4">
                      <Badge className={cn(
                        'border',
                        t.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'
                      )}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">{new Date(t.joinedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            alert(`Open KYC drawer for ${t.name}\n\n(Plug your real KYC viewer here)`);
                          }}
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" /> View KYC
                        </Button>
                        {t.kyc !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Approve KYC for ${t.name}?`)) setKycStatus(t.id, 'approved');
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                          </Button>
                        )}
                        {t.kyc !== 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const reason = prompt(`Reject KYC for ${t.name}. Enter reason:`);
                              if (reason !== null) setKycStatus(t.id, 'rejected');
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Toggle status for ${t.name}?`)) toggleStatus(t.id);
                          }}
                        >
                          {t.status === 'active' ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                          {t.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted">No tutors found. Try different filters.</td>
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
