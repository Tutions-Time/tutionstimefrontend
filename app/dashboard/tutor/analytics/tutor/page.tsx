'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, FileText, IndianRupee } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { getTutorNoteRevenue } from '@/services/razorpayService';

const KPI = [
  { label:'Classes (30d)', value:'22' },
  { label:'Earnings (30d)', value:'₹38,500' },
  { label:'Rating', value:'4.8' },
];

export default function TutorAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [noteRev, setNoteRev] = useState<{ total: number; count: number } | null>(null);
  useEffect(() => { (async () => { try { const data = await getTutorNoteRevenue(); setNoteRev(data || { total: 0, count: 0 }); } catch {} })(); }, []);
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
