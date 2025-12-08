'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, FileText, IndianRupee } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { getTutorNoteRevenue } from '@/services/razorpayService';
import { getTutorEarningsSummary } from '@/services/tutorService';
import { getTutorRatingTrend, getTutorProgressSummary, getTutorRetention, getTutorWeeklySummary } from '@/services/progressService';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

type TrendPoint = { weekStart: string; avgOverall: number; count: number };

export default function TutorAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [noteRev, setNoteRev] = useState<{ total: number; count: number } | null>(null);
  const [earnings, setEarnings] = useState<{ availableBalance: number; pendingBalance: number; totalCredits: number; bySource: Record<string, number> } | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [trendWeeks, setTrendWeeks] = useState<number>(8);
  const [retention, setRetention] = useState<{ conversion30d: number; conversion90d: number; repeatStudents30d: number; retention30d: number } | null>(null);
  const [weekly, setWeekly] = useState<any>(null);
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
      try {
        const w = await getTutorWeeklySummary();
        setWeekly(w?.data || null);
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
          {weekly && (
            <Card className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted">Sessions (7d)</div>
                  <div className="text-2xl font-bold">{weekly.sessions}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Completed (7d)</div>
                  <div className="text-2xl font-bold">{weekly.completed}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Attendance Consistency</div>
                  <div className="text-2xl font-bold">{weekly.attendanceConsistency}%</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 border rounded-xl">
                  <div className="font-semibold mb-2">Rubric Averages</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><span className="text-sm text-muted">Teaching</span><span className="text-sm font-semibold">{Math.round((weekly.rubricAverages?.teaching || 0)*100)/100}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-muted">Communication</span><span className="text-sm font-semibold">{Math.round((weekly.rubricAverages?.communication || 0)*100)/100}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-muted">Understanding</span><span className="text-sm font-semibold">{Math.round((weekly.rubricAverages?.understanding || 0)*100)/100}</span></div>
                  </div>
                </div>
                <div className="p-4 border rounded-xl">
                  <div className="font-semibold mb-2">Materials Uploaded</div>
                  <div className="w-full h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: 'Counts', notes: weekly.materials?.notes || 0, assignments: weekly.materials?.assignments || 0, recordings: weekly.materials?.recordings || 0 }]}
                        barGap={8} barSize={28}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee' }} />
                        <Legend />
                        <Bar dataKey="notes" name="Notes" fill="#6366F1" radius={[6,6,0,0]} />
                        <Bar dataKey="assignments" name="Assignments" fill="#F59E0B" radius={[6,6,0,0]} />
                        <Bar dataKey="recordings" name="Recordings" fill="#10B981" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {weekly.topComments?.length ? (
                <div className="mt-6">
                  <div className="font-semibold mb-2">Recent Feedback</div>
                  <ul className="space-y-2">
                    {weekly.topComments.map((c: string, i: number)=> (
                      <li key={i} className="text-sm text-muted">{c}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          )}
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
