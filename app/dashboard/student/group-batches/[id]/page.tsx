"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";

export default function StudentBatchDetailPage() {
  const params = useParams() as any;
  const id = params?.id as string;
  const router = useRouter();
  const [batch, setBatch] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const b = await api.get(`/group-batches/${id}`);
      setBatch(b.data?.data || null);
      const s = await api.get(`/group-batches/${id}/sessions`);
      setSessions(s.data?.data || []);
    } catch (e: any) {
      toast.error(e.message || "Unable to load batch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const join = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      const url = res.data?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Join window closed");
      }
    } catch (e: any) {
      toast.error(e.message || "Join failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Batch Sessions" subtitle="View and join your sessions" action={<Button variant="outline" onClick={()=>router.back()}>Back</Button>} />
        <main className="p-4 lg:p-6 space-y-4">
          {batch && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-3 space-y-1 text-sm bg-white">
                <div className="font-medium">Overview</div>
                <div>Subject: {batch.subject}</div>
                <div>Level: {batch.level || "General"}</div>
                <div>Type: {batch.batchType}</div>
                <div>Price: ₹{batch.pricePerStudent}</div>
              </div>
              <div className="border rounded p-3 space-y-1 text-sm bg-white">
                <div className="font-medium">Window</div>
                <div>Join before: {batch.accessWindow?.joinBeforeMin ?? 5} min</div>
                <div>Expire after: {batch.accessWindow?.expireAfterMin ?? 5} min</div>
                <div>Status: {batch.status}</div>
              </div>
            </div>
          )}
          <div className="border rounded p-3 space-y-3 bg-white">
            <div className="font-medium">Sessions</div>
            {loading && <div className="text-sm text-gray-500">Loading...</div>}
            {!loading && sessions.length === 0 && (
              <div className="text-sm text-gray-500">No sessions found</div>
            )}
            {!loading && sessions.length > 0 && (
              <ul className="space-y-3">
                {sessions.map((s:any)=> (
                  <li key={s._id} className="text-sm border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>{new Date(s.startDateTime).toLocaleString()}</div>
                      <Button size="sm" onClick={()=>join(s._id)}>Join</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                      <div>
                        {s.recordingUrl && <a className="text-blue-600" href={s.recordingUrl} target="_blank">Recording</a>}
                      </div>
                      <div>
                        {s.notesUrl && <a className="text-blue-600" href={s.notesUrl} target="_blank">Notes</a>}
                      </div>
                      <div>
                        {s.assignmentUrl && <a className="text-blue-600" href={s.assignmentUrl} target="_blank">Assignment</a>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
