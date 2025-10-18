'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Wallet, FileDown, Calendar as CalendarIcon, TrendingUp, TrendingDown, IndianRupee,
  RefreshCcw, CheckCircle, Clock, Search as SearchIcon
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/* ----------------------------- Mock Data Types ---------------------------- */
type PayMethod = 'UPI' | 'Card' | 'NetBanking' | 'Wallet';

type DailyRev = { date: string; gross: number; net: number; refunds: number; };
type SubjectSplit = { subject: string; amount: number; };
type PendingPayout = {
  tutorId: string; tutorName: string; upi: string;
  pendingAmount: number; lastPayoutOn?: string;
};

/* -------------------------------- Mock Data ------------------------------- */
const DAILY: DailyRev[] = [
  { date: '2025-10-01', gross: 145000, net: 137500, refunds: 2500 },
  { date: '2025-10-02', gross: 152400, net: 145200, refunds: 1200 },
  { date: '2025-10-03', gross: 132000, net: 127600, refunds: 1600 },
  { date: '2025-10-04', gross: 160800, net: 154400, refunds: 1200 },
  { date: '2025-10-05', gross: 171200, net: 162900, refunds: 2500 },
  { date: '2025-10-06', gross: 149500, net: 143800, refunds: 700 },
  { date: '2025-10-07', gross: 166300, net: 159900, refunds: 900 },
];

const SUBJECTS: SubjectSplit[] = [
  { subject: 'Mathematics', amount: 420000 },
  { subject: 'Physics', amount: 315000 },
  { subject: 'Chemistry', amount: 225000 },
  { subject: 'English', amount: 180000 },
  { subject: 'Biology', amount: 120000 },
];

const METHODS: Record<PayMethod, number> = {
  UPI: 0.54, Card: 0.28, NetBanking: 0.12, Wallet: 0.06
};

const PAYOUTS: PendingPayout[] = [
  { tutorId: 't_2001', tutorName: 'Ankit Sharma', upi: 'ankit@upi', pendingAmount: 18500, lastPayoutOn: '2025-09-30' },
  { tutorId: 't_2002', tutorName: 'Meera Iyer',  upi: 'meera@upi', pendingAmount: 32200, lastPayoutOn: '2025-09-30' },
  { tutorId: 't_2003', tutorName: 'Vikas Gupta',  upi: 'vikas@upi', pendingAmount: 8200 },
];

/* --------------------------------- Utils --------------------------------- */
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/* --------------------------------- Page ---------------------------------- */
export default function AdminRevenuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [from, setFrom] = useState('2025-10-01');
  const [to, setTo] = useState('2025-10-31');
  const [searchTutor, setSearchTutor] = useState('');

  // Local state for mock actions
  const [queue, setQueue] = useState<PendingPayout[]>(PAYOUTS);
  const [isProcessing, setIsProcessing] = useState(false);

  const rangedDaily = useMemo(() => {
    return DAILY.filter(d => d.date >= from && d.date <= to);
  }, [from, to]);

  const totals = useMemo(() => {
    const gross = rangedDaily.reduce((s, d) => s + d.gross, 0);
    const net = rangedDaily.reduce((s, d) => s + d.net, 0);
    const refunds = rangedDaily.reduce((s, d) => s + d.refunds, 0);
    const takeRate = gross ? (gross - net - refunds) / gross : 0; // simple mock
    return { gross, net, refunds, takeRate };
  }, [rangedDaily]);

  const subjectSorted = useMemo(
    () => [...SUBJECTS].sort((a, b) => b.amount - a.amount),
    []
  );

  const methodList = useMemo(() => {
    return (Object.keys(METHODS) as PayMethod[]).map(m => ({ method: m, pct: METHODS[m] }));
  }, []);

  const filteredQueue = useMemo(() => {
    const q = searchTutor.trim().toLowerCase();
    return queue.filter(p => p.tutorName.toLowerCase().includes(q) || p.upi.toLowerCase().includes(q));
  }, [queue, searchTutor]);

  function exportCsv(kind: 'daily' | 'subject' | 'payouts') {
    const rows =
      kind === 'daily'
        ? [['date', 'gross', 'net', 'refunds'], ...rangedDaily.map(d => [d.date, d.gross, d.net, d.refunds])]
        : kind === 'subject'
        ? [['subject', 'amount'], ...subjectSorted.map(s => [s.subject, s.amount])]
        : [['tutorId', 'tutorName', 'upi', 'pendingAmount', 'lastPayoutOn'], ...queue.map(p => [p.tutorId, p.tutorName, p.upi, p.pendingAmount, p.lastPayoutOn ?? ''])];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${kind}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function processPayouts() {
    if (!window.confirm('Process all pending payouts now?')) return;
    setIsProcessing(true);
    try {
      // mock delay
      await new Promise(r => setTimeout(r, 900));
      setQueue([]); // all paid
      alert('Payouts processed successfully. Audit ID: AUD-REV-1023');
    } finally {
      setIsProcessing(false);
    }
  }

  function markPaid(tutorId: string) {
    setQueue(prev => prev.filter(p => p.tutorId !== tutorId));
  }

  // Delta mock (compare first and last in range)
  const deltaGross = rangedDaily.length > 1
    ? ((rangedDaily.at(-1)!.gross - rangedDaily[0].gross) / rangedDaily[0].gross)
    : 0;

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
          {/* Filters row */}
          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted" />
                <input
                  type="date"
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted" />
                <input
                  type="date"
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="md:col-span-3 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => exportCsv('daily')}>
                  <FileDown className="w-4 h-4 mr-2" /> Export Daily
                </Button>
                <Button variant="outline" onClick={() => exportCsv('subject')}>
                  <FileDown className="w-4 h-4 mr-2" /> Export Subjects
                </Button>
                <Button variant="outline" onClick={() => exportCsv('payouts')}>
                  <FileDown className="w-4 h-4 mr-2" /> Export Payouts
                </Button>
              </div>
            </div>
          </Card>

          {/* KPI tiles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{inr(totals.gross)}</p>
                  <p className="text-sm text-muted">Gross (selected)</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{inr(totals.net)}</p>
                  <p className="text-sm text-muted">Net (after fees/refunds)</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <RefreshCcw className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{inr(totals.refunds)}</p>
                  <p className="text-sm text-muted">Refunds (selected)</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {deltaGross >= 0 ? <TrendingUp className="w-6 h-6 text-primary" /> : <TrendingDown className="w-6 h-6 text-danger" />}
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">
                    {(deltaGross * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted">Trend vs period start</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Daily revenue table */}
          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Daily Revenue</h3>
              <span className="text-sm text-muted">Range: {from} → {to}</span>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Gross</th>
                  <th className="px-4 py-3">Net</th>
                  <th className="px-4 py-3">Refunds</th>
                </tr>
              </thead>
              <tbody>
                {rangedDaily.map((d) => (
                  <tr key={d.date} className="border-t">
                    <td className="px-4 py-3">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{inr(d.gross)}</td>
                    <td className="px-4 py-3">{inr(d.net)}</td>
                    <td className="px-4 py-3">{inr(d.refunds)}</td>
                  </tr>
                ))}
                {rangedDaily.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-muted">No data in range.</td></tr>
                )}
              </tbody>
            </table>
          </Card>

          {/* Subject breakdown + Payment methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl bg-white shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Revenue by Subject</h3>
                <Button variant="outline" size="sm" onClick={() => exportCsv('subject')}>
                  <FileDown className="w-4 h-4 mr-2" /> CSV
                </Button>
              </div>
              <div className="p-4">
                <ul className="space-y-3">
                  {subjectSorted.map((s) => (
                    <li key={s.subject} className="flex items-center justify-between">
                      <span className="font-medium">{s.subject}</span>
                      <span className="text-muted">{inr(s.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="rounded-2xl bg-white shadow-sm">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Payment Methods Split</h3>
              </div>
              <div className="p-4 space-y-3">
                {methodList.map((m) => (
                  <div key={m.method}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{m.method}</span>
                      <span className="text-sm text-muted">{(m.pct * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded">
                      <div
                        className="h-2 bg-primary rounded"
                        style={{ width: `${m.pct * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

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
                <Button
                  className="bg-primary hover:bg-primary/90 text-text"
                  onClick={processPayouts}
                  disabled={isProcessing || queue.length === 0}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing…' : 'Process All'}
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
                    <tr key={p.tutorId} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                            {p.tutorName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-text">{p.tutorName}</div>
                            <Badge className="bg-primary/10 text-primary border-primary/20">#{p.tutorId}</Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{p.upi}</td>
                      <td className="px-4 py-3">{inr(p.pendingAmount)}</td>
                      <td className="px-4 py-3">{p.lastPayoutOn ? new Date(p.lastPayoutOn).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Mark payout paid for ${p.tutorName}?`)) markPaid(p.tutorId);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Paid
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQueue.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-muted">No pending payouts.</td></tr>
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
