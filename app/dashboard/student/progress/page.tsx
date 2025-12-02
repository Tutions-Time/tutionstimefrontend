'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { getStudentProgressSummary, getStudentProgressBySubject } from '@/services/progressService';

type Summary = {
  success: boolean;
  data?: {
    totals: {
      sessions: number;
      completed: number;
      attendanceRate: number;
      assignments: number;
      notes: number;
      recordings: number;
    };
    deltas: { completedVsPrev: number };
  };
};

export default function ProgressPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bySubject, setBySubject] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, b] = await Promise.all([
          getStudentProgressSummary(),
          getStudentProgressBySubject(),
        ]);
        setSummary(s);
        setBySubject(b?.data || []);
      } catch (err) {
        setSummary(null);
        setBySubject([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="My Progress" subtitle="Your learning analytics and achievements" />
        <main className="p-4 lg:p-6 space-y-6">
          {loading ? (
            <Card className="p-6 rounded-2xl bg-white shadow-sm">Loading progress...</Card>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary"/>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary?.data?.totals.completed ?? 0}</p>
                      <p className="text-sm text-muted">Sessions Completed</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary"/>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary?.data?.totals.attendanceRate ?? 0}%</p>
                      <p className="text-sm text-muted">Attendance Rate</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary"/>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary?.data?.totals.assignments ?? 0}</p>
                      <p className="text-sm text-muted">Assignments Received</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">By Subject</h3>
                {bySubject.length === 0 ? (
                  <Card className="p-6 rounded-2xl bg-white shadow-sm">No data</Card>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {bySubject.map((row: any) => (
                      <Card key={row.subject} className="p-4 rounded-2xl bg-white shadow-sm">
                        <div className="font-semibold">{row.subject}</div>
                        <div className="text-sm text-muted">Sessions: {row.sessions}</div>
                        <div className="text-sm text-muted">Completed: {row.completed}</div>
                        <div className="text-sm text-muted">Assignments: {row.assignments}</div>
                        <div className="text-sm text-muted">Notes: {row.notes}</div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
