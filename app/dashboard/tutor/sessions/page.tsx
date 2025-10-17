'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, BookOpen, CheckCircle } from 'lucide-react';

const CLASSES = [
  { id:'c1', student:'Aarav Sharma', subject:'Physics', date:'2025-10-14', time:'6:00 PM', status:'scheduled' as const, type:'demo' as const },
  { id:'c2', student:'Ishita Verma', subject:'Mathematics', date:'2025-10-12', time:'7:30 PM', status:'completed' as const, type:'regular' as const },
];

export default function TutorSessions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="My Classes" subtitle="Upcoming and past sessions" />
        <main className="p-4 lg:p-6 space-y-4">
          {CLASSES.map(c=>(
            <Card key={c.id} className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{c.student}</div>
                  <div className="text-sm text-muted">{c.subject} • {c.type==='demo'?'Demo':'Regular'}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/>{new Date(c.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/>{c.time}</span>
                  </div>
                </div>
                {c.status==='scheduled'
                  ? <Badge className="bg-primary/10 text-primary border-primary/20">Upcoming</Badge>
                  : <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1"/>Completed</Badge>}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline"><BookOpen className="w-4 h-4 mr-2"/>Materials</Button>
                {c.status==='scheduled' && <Button className="bg-primary hover:bg-primary/90 text-text"><Video className="w-4 h-4 mr-2"/>Start Class</Button>}
              </div>
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}
