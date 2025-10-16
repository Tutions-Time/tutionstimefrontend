'use client';

import { useState } from 'react';
import { Wallet as WalletIcon, Download } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TX = [
  { id:'tx1', date:'2025-10-01', desc:'Class Payment - Physics', amount:+1200 },
  { id:'tx2', date:'2025-10-05', desc:'Refund - Math', amount:-300 },
];

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const balance = TX.reduce((s,t)=>s+t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" userName="Gaurav"/>
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Wallet" subtitle="Your balance and transactions" action={<Button variant="outline"><Download className="w-4 h-4 mr-2"/>Export</Button>} />
        <main className="p-4 lg:p-6 space-y-6">
          <Card className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><WalletIcon className="w-6 h-6 text-primary"/></div>
              <div>
                <div className="text-sm text-muted">Current Balance</div>
                <div className="text-2xl font-bold">₹{balance.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </Card>

          <Card className="overflow-x-auto bg-white rounded-2xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {TX.map(t=>(
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-3">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{t.desc}</td>
                    <td className={`px-4 py-3 ${t.amount>=0?'text-success':'text-danger'}`}>{t.amount>=0?'+':''}₹{Math.abs(t.amount).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </main>
      </div>
    </div>
  );
}
