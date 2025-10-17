'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, CheckCircle } from 'lucide-react';

const SESSIONS = [
  { id:'1', tutor:'Dr. Sarah Johnson', subject:'Mathematics', date:'2025-10-15', time:'10:00 AM', status:'scheduled' as const },
  { id:'2', tutor:'Prof. Mike Chen', subject:'Physics', date:'2025-10-12', time:'02:00 PM', status:'completed' as const },
];

export default function StudentSessions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="My Sessions" subtitle="Upcoming and past classes" />
        <main className="p-4 lg:p-6 space-y-4">
          {SESSIONS.map(s=>(
            <Card key={s.id} className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{s.tutor}</div>
                  <div className="text-sm text-muted">{s.subject}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/>{new Date(s.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/>{s.time}</span>
                  </div>
                </div>
                {s.status==='scheduled'
                  ? <Badge className="bg-primary/10 text-primary border-primary/20">Upcoming</Badge>
                  : <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1"/>Completed</Badge>}
              </div>
              {s.status==='scheduled' && (
                <div className="mt-4">
                  <Button className="bg-primary hover:bg-primary/90 text-text"><Video className="w-4 h-4 mr-2"/>Join</Button>
                </div>
              )}
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}
