'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';

const KPI = [
  { label:'Classes (30d)', value:'22' },
  { label:'Earnings (30d)', value:'₹38,500' },
  { label:'Rating', value:'4.8' },
];

export default function TutorAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Tutor Analytics" subtitle="Performance and earnings overview" />
        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {KPI.map(k=>(
              <Card key={k.label} className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary"/>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{k.value}</p>
                    <p className="text-sm text-muted">{k.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-6 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-2 font-semibold"><TrendingUp className="w-5 h-5 text-primary"/> Weekly trend</div>
            <p className="text-sm text-muted mt-2">Drop in your chart here (Recharts) when wiring the API.</p>
          </Card>
        </main>
      </div>
    </div>
  );
}
