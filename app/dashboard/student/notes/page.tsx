'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Search, IndianRupee } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { searchNotes, getPurchasedNotes, createNoteOrder, verifyNotePayment, getDownloadUrl } from '@/services/noteService';

export default function NotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [board, setBoard] = useState('');
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPurchased = async () => {
    try {
      const res = await getPurchasedNotes();
      setPurchased(res.data || []);
    } catch {}
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await searchNotes({ q, subject, classLevel, board, page: 1, limit: 12 });
      setAllNotes(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPurchased(); fetchAll(); }, []);

  const purchasedIds = useMemo(() => new Set((purchased || []).map((p: any) => String(p?.note?._id))), [purchased]);

  const buy = async (note: any) => {
    try {
      const orderRes = await createNoteOrder(String(note._id));
      if (!orderRes?.orderId || !orderRes?.key) { toast({ title: 'Payment init failed', variant: 'destructive' }); return; }
      if (!(window as any).Razorpay) { toast({ title: 'Razorpay SDK not loaded', variant: 'destructive' }); return; }
      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: 'INR',
        name: 'TuitionTime',
        description: 'Paid Note',
        order_id: orderRes.orderId,
        handler: async (response: any) => {
          const verify = await verifyNotePayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }, String(note._id));
          if (verify?.success) { toast({ title: 'Purchased' }); fetchPurchased(); }
          else { toast({ title: 'Verification failed', variant: 'destructive' }); }
        },
        theme: { color: '#207EA9' },
      };
      const rz = new (window as any).Razorpay(options);
      rz.open();
    } catch { toast({ title: 'Payment failed', variant: 'destructive' }); }
  };

  const download = async (noteId: string) => {
    try {
      const res = await getDownloadUrl(noteId);
      if (res?.url) { window.open(res.url, '_blank'); }
    } catch { toast({ title: 'Download failed', variant: 'destructive' }); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Notes" subtitle="Search and purchase paid notes" />
        <main className="p-4 lg:p-6 space-y-6">
          <Card className="p-4 bg-white rounded-2xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input placeholder="Keywords" value={q} onChange={e=>setQ(e.target.value)} />
              <Input placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
              <Input placeholder="Class" value={classLevel} onChange={e=>setClassLevel(e.target.value)} />
              <Input placeholder="Board" value={board} onChange={e=>setBoard(e.target.value)} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={fetchAll}><Search className="w-4 h-4 mr-2"/>Search</Button>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="text-lg font-semibold">Purchased Notes</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(purchased || []).map((p:any)=> (
                <Card key={String(p?.note?._id)} className="p-4 bg-white rounded-2xl">
                  <div className="font-semibold">{p?.note?.title}</div>
                  <div className="text-sm text-muted">{p?.note?.subject} • {p?.note?.classLevel} • {p?.note?.board}</div>
                  <div className="mt-2 flex gap-2">
                    <Badge>{p?.purchase?.amount ? `₹${p?.purchase?.amount}` : ''}</Badge>
                    <Button size="sm" onClick={()=>download(String(p?.note?._id))}>Download</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-lg font-semibold">All Notes</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allNotes.map((n:any)=> (
                <Card key={String(n._id)} className="p-4 bg-white rounded-2xl">
                  <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-primary"/><div className="font-semibold">{n.title}</div></div>
                  <div className="text-sm text-muted">{n.subject} • {n.classLevel} • {n.board}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4"/><div className="font-medium">{n.price}</div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {purchasedIds.has(String(n._id)) ? (
                      <Button size="sm" onClick={()=>download(String(n._id))}>Download</Button>
                    ) : (
                      <Button size="sm" onClick={()=>buy(n)}>Buy Now</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
