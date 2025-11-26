'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { createNote, getMyNotes, updateNote, deleteNote } from '@/services/noteService';

export default function TutorNotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [board, setBoard] = useState('');
  const [price, setPrice] = useState('');
  const [keywords, setKeywords] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    try { const res = await getMyNotes(1, 20); setItems(res.data || []); } catch {}
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      if (!pdfFile) { toast({ title: 'PDF required', variant: 'destructive' }); return; }
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('subject', subject);
      fd.append('classLevel', classLevel);
      fd.append('board', board);
      fd.append('price', price);
      fd.append('keywords', keywords);
      fd.append('pdf', pdfFile);
      previewFiles.forEach((f) => fd.append('previews', f));
      const res = await createNote(fd);
      if (res?.success) { toast({ title: 'Note created' }); setTitle(''); setDescription(''); setSubject(''); setClassLevel(''); setBoard(''); setPrice(''); setKeywords(''); setPdfFile(null); setPreviewFiles([]); load(); }
      else { toast({ title: 'Create failed', variant: 'destructive' }); }
    } catch { toast({ title: 'Create failed', variant: 'destructive' }); }
  };

  const remove = async (id: string) => { try { await deleteNote(id); toast({ title: 'Deleted' }); load(); } catch {} };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Notes" subtitle="Upload and manage paid notes" />
        <main className="p-4 lg:p-6 space-y-6">
          <Card className="p-4 bg-white rounded-2xl">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
              <Input placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
              <Input placeholder="Class" value={classLevel} onChange={e=>setClassLevel(e.target.value)} />
              <Input placeholder="Board" value={board} onChange={e=>setBoard(e.target.value)} />
              <Input placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} />
              <Input placeholder="Keywords (comma separated)" value={keywords} onChange={e=>setKeywords(e.target.value)} />
              <input type="file" accept="application/pdf" onChange={e=>setPdfFile(e.target.files?.[0]||null)} />
              <input type="file" multiple accept="image/*" onChange={e=>setPreviewFiles(Array.from(e.target.files||[]))} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={submit}>Create</Button>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((n:any)=> (
              <Card key={String(n._id)} className="p-4 bg-white rounded-2xl">
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-muted">{n.subject} • {n.classLevel} • {n.board}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="destructive" onClick={()=>remove(String(n._id))}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

