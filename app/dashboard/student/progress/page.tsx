'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';

const METRICS = [
  { label:'Overall Score', value:'85%' },
  { label:'Math Mastery', value:'78%' },
  { label:'Physics Mastery', value:'88%' },
];

export default function ProgressPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="My Progress" subtitle="Your learning analytics and achievements" />
        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {METRICS.map(m=>(
              <Card key={m.label} className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary"/>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-sm text-muted">{m.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
