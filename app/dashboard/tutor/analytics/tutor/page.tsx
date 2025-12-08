'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, FileText, IndianRupee } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { getTutorNoteRevenue } from '@/services/razorpayService';
import { getTutorEarningsSummary } from '@/services/tutorService';
import { getTutorRatingTrend, getTutorProgressSummary, getTutorRetention } from '@/services/progressService';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

type TrendPoint = { weekStart: string; avgOverall: number; count: number };

export default function TutorAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [noteRev, setNoteRev] = useState<{ total: number; count: number } | null>(null);
  const [earnings, setEarnings] = useState<{ availableBalance: number; pendingBalance: number; totalCredits: number; bySource: Record<string, number> } | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [trendWeeks, setTrendWeeks] = useState<number>(8);
  const [retention, setRetention] = useState<{ conversion30d: number; conversion90d: number; repeatStudents30d: number; retention30d: number } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const nr = await getTutorNoteRevenue();
        setNoteRev(nr || { total: 0, count: 0 });
      } catch {}
      try {
        const es = await getTutorEarningsSummary();
        setEarnings(es || null);
      } catch {}
      try {
        const ps = await getTutorProgressSummary();
        setSummary(ps?.data || null);
      } catch {}
      try {
        const rt = await getTutorRatingTrend({ weeks: trendWeeks });
        setTrend(rt?.data?.series || []);
      } catch {}
      try {
        const r = await getTutorRetention();
        setRetention(r?.data || null);
      } catch {}
    })();
  }, [trendWeeks]);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Tutor Analytics" subtitle="Performance and earnings overview" />
        <main className="p-4 lg:p-6 space-y-6">
          {noteRev && (
            <Card className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary"/>
                </div>
                <div>
                  <p className="text-sm text-muted">Note Revenue</p>
                  <p className="text-2xl font-bold text-text flex items-center gap-2"><IndianRupee className="w-5 h-5"/>{(noteRev.total || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted">{noteRev.count || 0} notes sold</p>
                </div>
              </div>
            </Card>
          )}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary"/>
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary ? String(summary.totals.completed) : '—'}</p>
                  <p className="text-sm text-muted">Completed (7d)</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-primary"/>
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{(earnings?.totalCredits || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted">Credits (30d)</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary"/>
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary ? String(Math.round((summary.totals.averageRating || 0) * 100) / 100) : '—'}</p>
                  <p className="text-sm text-muted">Avg Rating</p>
                </div>
              </div>
            </Card>
          </div>
          <Card className="p-6 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold"><TrendingUp className="w-5 h-5 text-primary"/> Weekly rating trend</div>
              <div className="flex items-center gap-2">
                <select className="h-8 rounded-md border px-2 text-xs" value={trendWeeks} onChange={(e)=> setTrendWeeks(Number(e.target.value))}>
                  <option value={4}>4 weeks</option>
                  <option value={8}>8 weeks</option>
                  <option value={12}>12 weeks</option>
                </select>
              </div>
            </div>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="weekStart" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0,5]} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee' }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgOverall" name="Avg Rating" stroke="#6366F1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          {retention && (
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6 rounded-2xl bg-white shadow-sm"><div className="text-sm text-muted">Demo→Regular (30d)</div><div className="text-2xl font-bold">{retention.conversion30d}</div></Card>
              <Card className="p-6 rounded-2xl bg-white shadow-sm"><div className="text-sm text-muted">Demo→Regular (90d)</div><div className="text-2xl font-bold">{retention.conversion90d}</div></Card>
              <Card className="p-6 rounded-2xl bg-white shadow-sm"><div className="text-sm text-muted">Repeat Students (30d)</div><div className="text-2xl font-bold">{retention.repeatStudents30d}</div></Card>
              <Card className="p-6 rounded-2xl bg-white shadow-sm"><div className="text-sm text-muted">Retention 30d</div><div className="text-2xl font-bold">{retention.retention30d}%</div></Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
