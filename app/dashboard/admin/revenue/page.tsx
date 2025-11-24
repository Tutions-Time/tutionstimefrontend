'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Wallet, CheckCircle, Clock, Search as SearchIcon, IndianRupee, TrendingUp } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getMyWallet } from '@/services/walletService';
import { getAdminPayouts, settleAdminPayout } from '@/services/razorpayService';

/* Real UI */

/* --------------------------------- Utils --------------------------------- */
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/* --------------------------------- Page ---------------------------------- */
export default function AdminRevenuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminWallet, setAdminWallet] = useState<any>(null);
  const [searchTutor, setSearchTutor] = useState('');
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredQueue = useMemo(() => {
    const q = searchTutor.trim().toLowerCase();
    return queue.filter(p => (p.tutorName?.toLowerCase().includes(q)) || (p.upi?.toLowerCase().includes(q)));
  }, [queue, searchTutor]);

  useEffect(() => {
    (async () => {
      try {
        const w = await getMyWallet();
        setAdminWallet(w);
      } catch {}
    })();
  }, []);

  async function refreshPayouts() {
    setLoading(true);
    try {
      const payouts = await getAdminPayouts({ status: 'created' });
      const display = payouts.map((p: any) => ({
        _id: p._id,
        tutorId: p.tutorId,
        tutorName: p.tutorName || 'Tutor',
        upi: p.upi || '',
        pendingAmount: p.tutorNetAmount ?? Math.max(0, p.amount - (p.commissionAmount || 0)),
        lastPayoutOn: p.periodEnd,
      }));
      setQueue(display);
    } finally {
      setLoading(false);
    }
  }

  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={4} userRole="admin" userName="Admin" />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title="Revenue"
          subtitle="Financial overview, breakdowns, and payouts"
          greeting
          action={
            <Link href="/dashboard/admin/">
              <Button className="bg-primary hover:bg-primary/90 text-text">
                <TrendingUp className="w-4 h-4 mr-2" />
                Go to Analytics
              </Button>
            </Link>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Admin Wallet */}

          <Card className="p-6 rounded-2xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Admin Wallet Balance</p>
                  <p className="text-2xl font-bold text-text">{inr(Number(adminWallet?.balance || 0))}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted">Hold Amount</p>
                  <p className="text-2xl font-bold text-text">{inr(Number(adminWallet?.holdAmount || 0))}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Currency</p>
                  <p className="text-2xl font-bold text-text">{adminWallet?.currency || 'INR'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Real Payouts Queue */}

          {/* Payouts Queue */}
          <Card className="rounded-2xl bg-white shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Payouts Queue</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-muted" />
                  <Input
                    placeholder="Search tutor/UPI"
                    className="pl-9"
                    value={searchTutor}
                    onChange={(e) => setSearchTutor(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={refreshPayouts}>
                  <Clock className="w-4 h-4 mr-2" /> Refresh
                </Button>
              </div>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Tutor</th>
                    <th className="px-4 py-3">UPI</th>
                    <th className="px-4 py-3">Pending</th>
                    <th className="px-4 py-3">Last Payout</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                            {p.tutorName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-text">{p.tutorName}</div>
                            <Badge className="bg-primary/10 text-primary border-primary/20">#{p.tutorId}</Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{p.upi || '—'}</td>
                      <td className="px-4 py-3">{inr(p.pendingAmount)}</td>
                      <td className="px-4 py-3">{p.lastPayoutOn ? new Date(p.lastPayoutOn).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!window.confirm(`Mark payout paid for ${p.tutorName}?`)) return;
                              try {
                                await settleAdminPayout(p._id);
                                setQueue(prev => prev.filter(x => x._id !== p._id));
                              } catch {}
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Paid
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQueue.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-muted">{loading ? 'Loading…' : 'No pending payouts.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
