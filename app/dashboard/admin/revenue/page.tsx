'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Wallet, CheckCircle, Clock, IndianRupee, TrendingUp } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getMyWallet } from '@/services/walletService';
import { settleAdminPayout, getAdminAllPaymentHistory } from '@/services/razorpayService';

/* Real UI */

/* --------------------------------- Utils --------------------------------- */
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/* --------------------------------- Page ---------------------------------- */
export default function AdminRevenuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminWallet, setAdminWallet] = useState<any>(null);
  const [txItems, setTxItems] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txFrom, setTxFrom] = useState<string>('');
  const [txTo, setTxTo] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('');
  const [txType, setTxType] = useState<'subscription' | 'note' | 'group' | 'payout' | ''>('');
  const [txTutor, setTxTutor] = useState<string>('');
  const [txStudent, setTxStudent] = useState<string>('');
  const [txPage, setTxPage] = useState<number>(1);
  const [txLimit, setTxLimit] = useState<number>(20);
  const [txPages, setTxPages] = useState<number>(1);
  const [txTotal, setTxTotal] = useState<number>(0);
  const txSummary = useMemo(() => {
    const total = txItems.reduce((sum, h) => sum + Number(h.amount || 0), 0);
    const count = txItems.length;
    const byStatus = txItems.reduce<Record<string, number>>((acc, h) => {
      const s = h.status || 'unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return { total, count, byStatus };
  }, [txItems]);

  const debounce = (fn: () => void, ms = 400) => {
    const id = setTimeout(fn, ms);
    return () => clearTimeout(id);
  };

  function exportHistoryCsv() {
    const header = ['Date','Student','Tutor','Amount','Currency','Plan','Classes','Gateway','OrderId','PaymentId','Status'];
    const rows = txItems.map((h: any) => [
      new Date(h.createdAt).toISOString(),
      h.studentName,
      h.tutorName,
      String(h.amount || 0),
      h.currency || 'INR',
      h.planType || h.noteTitle || '',
      String(h.classCount ?? ''),
      (h.gateway || '').toUpperCase(),
      h.gatewayOrderId || '',
      h.gatewayPaymentId || '',
      h.status || ''
    ]);
    const csv = [header, ...rows].map((r: any[]) => r.map((v: any) => `${String(v).replace(/"/g,'""')}`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${txFrom || 'all'}-${txTo || 'all'}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  

  useEffect(() => {
    (async () => {
      try {
        const w = await getMyWallet();
        setAdminWallet(w);
      } catch {}
    })();
  }, []);


  async function refreshTx() {
    setTxLoading(true);
    try {
      const params: any = { page: txPage, limit: txLimit };
      if (txFrom) params.from = txFrom;
      if (txTo) params.to = txTo;
      if (txStatus) params.status = txStatus;
      if (txType) params.type = txType;
      if (txTutor.trim()) params.tutor = txTutor.trim();
      if (txStudent.trim()) params.student = txStudent.trim();
      const res = await getAdminAllPaymentHistory(params);
      setTxItems(res.data);
      const p = res.pagination;
      if (p) {
        setTxTotal(p.total || 0);
        setTxPages(p.pages || 1);
        setTxPage(p.page || txPage);
        setTxLimit(p.limit || txLimit);
      }
    } finally {
      setTxLoading(false);
    }
  }

  useEffect(() => {
    refreshTx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refreshTx(); }, [txPage, txLimit, txStatus, txType]);
  useEffect(() => { setTxPage(1); const c = debounce(refreshTx); return c; }, [txFrom, txTo, txTutor, txStudent]);

  

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

          

          {/* Transactions (Combined, paginated) */}
          <Card className="rounded-2xl bg-white shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              {/* <h3 className="font-semibold">Transactions</h3> */}
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap flex-nowrap">
                <select className="h-8 rounded-md border px-2 text-xs" value={txType} onChange={(e) => setTxType(e.target.value as any)}>
                  <option value="">All Types</option>
                  <option value="subscription">Subscription</option>
                  <option value="note">Note</option>
                  <option value="group">Group</option>
                  <option value="payout">Payout</option>
                </select>
                <select className="h-8 rounded-md border px-2 text-xs" value={txStatus} onChange={(e) => setTxStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                  <option value="settled">Settled</option>
                  <option value="created">Created</option>
                </select>
                <input type="date" className="text-sm border rounded-md px-2 py-2" value={txFrom} onChange={(e) => setTxFrom(e.target.value)} />
                <input type="date" className="text-sm border rounded-md px-2 py-2" value={txTo} onChange={(e) => setTxTo(e.target.value)} />
                <Input className="h-8 text-xs w-32" placeholder="Student" value={txStudent} onChange={(e) => setTxStudent(e.target.value)} />
                <Input className="h-8 text-xs w-32" placeholder="Tutor" value={txTutor} onChange={(e) => setTxTutor(e.target.value)} />
                <select className="h-8 rounded-md border px-2 text-xs" value={txLimit} onChange={(e) => setTxLimit(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <Button variant="outline" size="sm" onClick={refreshTx}>Apply</Button>
                <Button variant="outline" size="sm" onClick={exportHistoryCsv}>Export CSV</Button>
              </div>
            </div>
            {/* <div className="px-4 pb-2 text-xs text-muted flex flex-wrap items-center gap-3">
              <span>Total Amount (page): <span className="font-semibold">{inr(txSummary.total)}</span></span>
              <span>Count (page): <span className="font-semibold">{txSummary.count}</span></span>
              <span>Paid: <span className="font-semibold">{txSummary.byStatus['paid'] || 0}</span></span>
              <span>Failed: <span className="font-semibold">{txSummary.byStatus['failed'] || 0}</span></span>
            </div> */}
            
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
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {txItems.map((h: any) => (
                    <tr key={h._id} className="border-t">
                      <td className="px-4 py-3 text-muted">{new Date(h.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">{h.studentName || h.studentId || '—'}</td>
                      <td className="px-4 py-3">{h.tutorName || h.tutorId || '—'}</td>
                      <td className="px-4 py-3">₹{Number(h.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">{h.subject || h.noteTitle || ''} {h.planType ? `(${h.planType}${h.classCount ? `, ${h.classCount} classes` : ''})` : (h.type === 'payout' ? '(Payout)' : '')}</td>
                      <td className="px-4 py-3">{h.gateway?.toUpperCase() || (h.type === 'payout' && h.payoutUpi ? `UPI:${h.payoutUpi}` : '—')}</td>
                      <td className="px-4 py-3 font-mono text-xs">{h.gatewayOrderId || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{h.gatewayPaymentId || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn(
                          h.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                          h.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                          h.status === 'settled' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        )}>
                          {h.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {h.type === 'payout' && h.status === 'created' && (
                          <Button size="sm" variant="outline" onClick={async () => { try { await settleAdminPayout(h._id); refreshTx(); } catch {} }}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Settle
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {txItems.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-muted">{txLoading ? 'Loading…' : 'No transactions found.'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-xs text-muted">Total {txTotal} • Page {txPage} of {txPages}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={txPage <= 1} onClick={() => setTxPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button size="sm" variant="outline" disabled={txPage >= txPages} onClick={() => setTxPage((p) => Math.min(txPages, p + 1))}>Next</Button>
              </div>
            </div>
          </Card>

        </main>
      </div>
    </div>
  );
}
