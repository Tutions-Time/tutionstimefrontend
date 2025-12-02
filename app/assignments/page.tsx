'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStudentRegularClasses } from '@/services/studentService';
import { getRegularClassSessions } from '@/services/tutorService';

type AssignmentItem = {
  id: string;
  title: string;
  subject: string;
  due?: string;
  url: string;
};

export default function AssignmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const classes = await getStudentRegularClasses();
        const sessionsLists = await Promise.all(
          (classes || []).map((rc: any) => getRegularClassSessions(rc.regularClassId))
        );
        const assignments: AssignmentItem[] = [];
        sessionsLists.forEach((res: any, idx: number) => {
          const rc = classes[idx];
          const sessions = res?.success ? (res.data || []) : [];
          sessions.forEach((s: any) => {
            if (s.status === 'completed' && s.assignmentUrl) {
              assignments.push({
                id: s._id,
                title: `${rc.subject} • Session ${new Date(s.startDateTime).toLocaleDateString('en-IN')}`,
                subject: rc.subject,
                due: undefined,
                url: s.assignmentUrl,
              });
            }
          });
        });
        setItems(assignments);
      } catch (err) {
        setItems([]);
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
        <Topbar title="Assignments" subtitle="Your homework and classwork" />
        <main className="p-4 lg:p-6 space-y-4">
          {loading && (
            <Card className="p-5 rounded-2xl bg-white shadow-sm">Loading assignments...</Card>
          )}
          {!loading && items.length === 0 && (
            <Card className="p-5 rounded-2xl bg-white shadow-sm">No assignments available yet.</Card>
          )}
          {!loading && items.map((i)=> (
            <Card key={i.id} className="p-5 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{i.title}</div>
                  <div className="text-sm text-muted">{i.subject}</div>
                </div>
                <a href={i.url} target="_blank" rel="noreferrer">
                  <Button variant="outline">Download</Button>
                </a>
              </div>
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}
