"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

import {
  getStudentProgressSummary,
  getStudentProgressBySubject,
} from "@/services/progressService";

export default function ProgressPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overall, setOverall] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      const summaryRes = await getStudentProgressSummary();
      const subjectsRes = await getStudentProgressBySubject();

      setOverall(summaryRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !overall)
    return <p className="p-6 text-gray-600">Loading analytics...</p>;

  // Unified KPI dataset
  const kpiData = [
    {
      month: "JAN",
      sessions: overall.totals.sessions,
      completed: overall.totals.completed,
      assignments: overall.totals.assignments,
      notes: overall.totals.notes,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="student"
      />
      <Sidebar
        userRole="student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar title="My Progress" subtitle="Learning analytics dashboard" />

        <main className="p-4 lg:p-6 space-y-10">


          {/* ---------- UNIFIED KPI BAR CHART ---------- */}
          <Card className="p-8 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">Overall Performance Summary</h2>

            <div className="w-full overflow-x-auto pb-4">
              <div className="min-w-[600px] md:min-w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kpiData}
                    barGap={12}
                    barSize={40}
                  >

                    {/* Gradient Colors */}
                    <defs>
                      <linearGradient id="kpiSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4" />
                      </linearGradient>

                      <linearGradient id="kpiCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
                      </linearGradient>

                      <linearGradient id="kpiAssignments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.4" />
                      </linearGradient>

                      <linearGradient id="kpiNotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 14, fill: "#374151" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fontSize: 12, fill: "#374151" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #eee",
                        background: "white",
                        padding: "10px 14px",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                      }}
                    />

                    <Legend height={40} />

                    <Bar
                      dataKey="sessions"
                      fill="url(#kpiSessions)"
                      name="Total Sessions"
                      radius={[10, 10, 0, 0]}
                    />

                    <Bar
                      dataKey="completed"
                      fill="url(#kpiCompleted)"
                      name="Completed Sessions"
                      radius={[10, 10, 0, 0]}
                    />

                    <Bar
                      dataKey="assignments"
                      fill="url(#kpiAssignments)"
                      name="Assignments Submitted"
                      radius={[10, 10, 0, 0]}
                    />

                    <Bar
                      dataKey="notes"
                      fill="url(#kpiNotes)"
                      name="Notes Viewed"
                      radius={[10, 10, 0, 0]}
                    />

                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>



          {/* ---------- SUBJECT BAR CHART ---------- */}
          <Card className="p-8 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">Subject-wise Performance</h2>

            <div className="w-full overflow-x-auto pb-4">
              <div className="min-w-[650px] md:min-w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjects} barGap={6} barSize={28}>

                    <defs>
                      <linearGradient id="sessionsColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4" />
                      </linearGradient>

                      <linearGradient id="completedColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
                      </linearGradient>

                      <linearGradient id="assignColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.4" />
                      </linearGradient>

                      <linearGradient id="notesColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="subject"
                      tick={{ fontSize: 12, fill: "#4B5563" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fontSize: 12, fill: "#4B5563" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #eee",
                        background: "white",
                        padding: "10px 14px",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ fontWeight: 600 }}
                    />

                    <Legend
                      verticalAlign="top"
                      height={40}
                      formatter={(value) => (
                        <span className="text-sm text-gray-700">{value}</span>
                      )}
                    />

                    <Bar dataKey="sessions" fill="url(#sessionsColor)" name="Sessions" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" fill="url(#completedColor)" name="Completed" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="assignments" fill="url(#assignColor)" name="Assignments" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="notes" fill="url(#notesColor)" name="Notes" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>


          {/* ---------- ATTENDANCE CHART ---------- */}
          <Card className="p-10 bg-white shadow-xl rounded-2xl border border-gray-100">
            <h2 className="text-lg font-semibold mb-8">Attendance Rate</h2>

            <div className="flex justify-center relative">
              <ResponsiveContainer width="60%" height={260}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={450}
                  data={[
                    {
                      name: "Attendance",
                      value: overall.totals.attendanceRate,
                      fill: "url(#attendanceGradient)",
                    },
                  ]}
                >
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  <RadialBar
                    dataKey="value"
                    background={{ fill: "#E5E7EB" }}
                    cornerRadius={50}
                    animationDuration={1400}
                  />
                </RadialBarChart>
              </ResponsiveContainer>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <p className="text-5xl font-extrabold text-yellow-400">
                  {overall.totals.attendanceRate}%
                </p>
              </div>
            </div>
          </Card>


        </main>
      </div>
    </div>
  );
}
