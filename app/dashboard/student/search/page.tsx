'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Star, Filter } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MOCK_TUTORS = [
  { id: 't1', name: 'Dr. Sarah Johnson', subject: 'Mathematics', rating: 4.9, city: 'Delhi', rate: 600 },
  { id: 't2', name: 'Prof. Mike Chen', subject: 'Physics', rating: 4.7, city: 'Mumbai', rate: 550 },
];

export default function SearchTutors() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState('');
  const results = MOCK_TUTORS.filter(t => (t.name+t.subject+t.city).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={1} userRole="student" userName="Gaurav"/>
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar title="Find Tutors" subtitle="Search and book your next class" />
        <main className="p-4 lg:p-6 space-y-6">
          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <Input className="pl-9" placeholder="Subject, tutor, city…" value={q} onChange={(e)=>setQ(e.target.value)}/>
              </div>
              <select className="h-10 rounded-md border px-3 text-sm">
                <option>All Subjects</option><option>Mathematics</option><option>Physics</option>
              </select>
              <Button variant="outline"><Filter className="w-4 h-4 mr-2"/>Filters</Button>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(t => (
              <Card key={t.id} className="p-4 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    {t.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted">{t.subject}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <div className="flex items-center gap-1"><Star className="w-4 h-4 text-warning"/>{t.rating}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4"/>{t.city}</div>
                  <div>₹{t.rate}/hr</div>
                </div>
                <Link href={`/tutor/${t.id}`} className="mt-3 block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-text">View Profile</Button>
                </Link>
              </Card>
            ))}
            {results.length===0 && <Card className="p-10 text-center text-muted">No tutors found.</Card>}
          </div>
        </main>
      </div>
    </div>
  );
}
