'use client';

import { useState } from 'react';
import { FileText, Plus, Save } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Note = { id:string; title:string; body:string };

export default function NotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([{ id:'n1', title:'Limits Cheat Sheet', body:'Key formulas…'}]);
  const [title, setTitle] = useState(''); const [body, setBody] = useState('');

  function add() {
    if (!title.trim()) return;
    setNotes(prev=>[{ id:`n${Date.now()}`, title, body }, ...prev]);
    setTitle(''); setBody('');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" userName="Gaurav"/>
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Notes" subtitle="Keep your study notes organized" action={<Button className="bg-primary text-text" onClick={add}><Plus className="w-4 h-4 mr-2"/>Add</Button>} />
        <main className="p-4 lg:p-6 space-y-6">
          <Card className="p-4 bg-white rounded-2xl">
            <div className="grid gap-3">
              <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}/>
              <textarea className="min-h-28 rounded-md border p-3 text-sm" placeholder="Write note…" value={body} onChange={e=>setBody(e.target.value)} />
              <Button variant="outline" onClick={add}><Save className="w-4 h-4 mr-2"/>Save</Button>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(n=>(
              <Card key={n.id} className="p-4 bg-white rounded-2xl">
                <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-primary"/><div className="font-semibold">{n.title}</div></div>
                <p className="text-sm text-muted">{n.body || '—'}</p>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
