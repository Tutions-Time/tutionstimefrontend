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
import { getAdminPayouts, settleAdminPayout, getAdminPaymentHistory } from '@/services/razorpayService';

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
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFrom, setHistoryFrom] = useState<string>('');
  const [historyTo, setHistoryTo] = useState<string>('');
  const historySummary = useMemo(() => {
    const total = history.reduce((sum, h) => sum + Number(h.amount || 0), 0);
    const count = history.length;
    const byStatus = history.reduce<Record<string, number>>((acc, h) => {
      const s = h.status || 'unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return { total, count, byStatus };
  }, [history]);

  function exportHistoryCsv() {
    const header = ['Date','Student','Tutor','Amount','Currency','Plan','Classes','Gateway','OrderId','PaymentId','Status'];
    const rows = history.map(h => [
      new Date(h.createdAt).toISOString(),
      h.studentName,
      h.tutorName,
      String(h.amount || 0),
      h.currency || 'INR',
      h.planType || '',
      String(h.classCount ?? ''),
      (h.gateway || '').toUpperCase(),
      h.gatewayOrderId || '',
      h.gatewayPaymentId || '',
      h.status || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `${String(v).replace(/"/g,'""')}`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${historyFrom || 'all'}-${historyTo || 'all'}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

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

  async function refreshHistory() {
    setHistoryLoading(true);
    try {
      const params: any = { status: 'paid' };
      if (historyFrom) params.from = historyFrom;
      if (historyTo) params.to = historyTo;
      const rows = await getAdminPaymentHistory(params);
      setHistory(rows);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    refreshPayouts();
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

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

          {/* Payment History */}
          <Card className="rounded-2xl bg-white shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Payment History</h3>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="text-sm border rounded-md px-2 py-2"
                  value={historyFrom}
                  onChange={(e) => setHistoryFrom(e.target.value)}
                />
                <input
                  type="date"
                  className="text-sm border rounded-md px-2 py-2"
                  value={historyTo}
                  onChange={(e) => setHistoryTo(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={refreshHistory}>Apply</Button>
                <Button variant="outline" size="sm" onClick={exportHistoryCsv}>Export CSV</Button>
              </div>
            </div>
            <div className="px-4 pb-2 text-xs text-muted flex items-center gap-4">
              <span>Total: <span className="font-semibold">{inr(historySummary.total)}</span></span>
              <span>Count: <span className="font-semibold">{historySummary.count}</span></span>
              <span>
                Paid: <span className="font-semibold">{historySummary.byStatus['paid'] || 0}</span>
                , Failed: <span className="font-semibold">{historySummary.byStatus['failed'] || 0}</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Tutor</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Class / Plan</th>
                    <th className="px-4 py-3">Gateway</th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h: any) => (
                    <tr key={h._id} className="border-t">
                      <td className="px-4 py-3 text-muted">{new Date(h.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">{h.studentName}</td>
                      <td className="px-4 py-3">{h.tutorName}</td>
                      <td className="px-4 py-3">₹{Number(h.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">{h.subject || ''} {h.planType ? `(${h.planType}${h.classCount ? `, ${h.classCount} classes` : ''})` : ''}</td>
                      <td className="px-4 py-3">{h.gateway?.toUpperCase() || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{h.gatewayOrderId || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{h.gatewayPaymentId || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn(
                          h.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                          h.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        )}>
                          {h.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-muted">{historyLoading ? 'Loading…' : 'No payments found.'}</td>
                    </tr>
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
