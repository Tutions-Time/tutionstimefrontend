'use client';

import { useState } from 'react';
import { ClipboardList, Upload, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ITEMS = [
  { id:'a1', title:'Algebra Worksheet 3', subject:'Math', due:'2025-10-18', status:'pending' as const },
  { id:'a2', title:'Optics Numericals', subject:'Physics', due:'2025-10-12', status:'submitted' as const },
];

export default function AssignmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Assignments" subtitle="Your homework and classwork" />
        <main className="p-4 lg:p-6 space-y-4">
          {ITEMS.map(i=>(
            <Card key={i.id} className="p-5 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{i.title}</div>
                  <div className="text-sm text-muted">{i.subject} • Due {new Date(i.due).toLocaleDateString()}</div>
                </div>
                {i.status==='submitted'
                  ? <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1"/>Submitted</Badge>
                  : <Button variant="outline"><Upload className="w-4 h-4 mr-2"/>Submit</Button>}
              </div>
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}
