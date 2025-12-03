"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { getTutorWeeklySummary } from "@/services/progressService";

export default function TutorWeeklySummaryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTutorWeeklySummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  const data = summary?.data || {};
  const r = data?.rubricAverages || { teaching: 0, communication: 0, understanding: 0 };
  const m = data?.materials || { notes: 0, assignments: 0, recordings: 0 };
  const comments: string[] = data?.topComments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Weekly Summary" subtitle="Last 7 days performance snapshot" />

        <main className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
          {loading ? (
            <Card className="p-6 rounded-2xl bg-white shadow-sm">Loading weekly summary...</Card>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6 rounded-2xl bg-white shadow-sm">
                  <div className="text-sm text-muted">Sessions</div>
                  <div className="text-2xl font-bold">{data.sessions ?? 0}</div>
                </Card>
                <Card className="p-6 rounded-2xl bg-white shadow-sm">
                  <div className="text-sm text-muted">Completed</div>
                  <div className="text-2xl font-bold">{data.completed ?? 0}</div>
                </Card>
                <Card className="p-6 rounded-2xl bg-white shadow-sm">
                  <div className="text-sm text-muted">Attendance Consistency</div>
                  <div className="text-2xl font-bold">{data.attendanceConsistency ?? 0}%</div>
                </Card>
              </div>

              <Card className="p-6 rounded-2xl bg-white shadow-sm">
                <div className="text-sm font-semibold mb-2">Rubric Averages</div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-muted">Teaching</div>
                    <div className="font-semibold">{r.teaching?.toFixed?.(1) ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted">Communication</div>
                    <div className="font-semibold">{r.communication?.toFixed?.(1) ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted">Understanding</div>
                    <div className="font-semibold">{r.understanding?.toFixed?.(1) ?? "-"}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl bg-white shadow-sm">
                <div className="text-sm font-semibold mb-2">Materials Uploaded</div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-muted">Notes</div>
                    <div className="font-semibold">{m.notes ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-muted">Assignments</div>
                    <div className="font-semibold">{m.assignments ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-muted">Recordings</div>
                    <div className="font-semibold">{m.recordings ?? 0}</div>
                  </div>
                </div>
              </Card>

              {comments?.length ? (
                <Card className="p-6 rounded-2xl bg-white shadow-sm">
                  <div className="text-sm font-semibold mb-2">Top Comments</div>
                  <ul className="space-y-2">
                    {comments.map((c, i) => (
                      <li key={i} className="text-sm text-gray-700">"{c}"</li>
                    ))}
                  </ul>
                </Card>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

