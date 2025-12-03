"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

export default function TutorBatchDetailPage() {
  const enabled = String(process.env.NEXT_PUBLIC_FEATURE_GROUP_BATCHES || "false").toLowerCase() === "true";
  const params = useParams() as any;
  const id = params?.id as string;
  const [roster, setRoster] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);

  const load = async () => {
    try {
      const r = await api.get(`/group-batches/${id}/roster`);
      setRoster(r.data?.data || []);
      const s = await api.get(`/group-batches/${id}/sessions`);
      setSessions(s.data?.data || []);
    } catch (e:any) {}
  };

  useEffect(()=>{ if (enabled && id) load(); },[enabled, id]);

  const broadcast = async () => {
    try {
      const res = await api.post(`/group-batches/${id}/announce`, { title, body });
      if (res.data?.success) { toast.success("Sent"); setTitle(""); setBody(""); } else { toast.error("Failed"); }
    } catch (e:any) { toast.error(e.message || "Failed"); }
  };

  if (!enabled) return <div className="p-6">Feature disabled</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Batch Detail</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4 space-y-2">
          <div className="font-medium">Roster</div>
          <ul className="space-y-1">
            {roster.map((s:any)=> (<li key={s._id} className="text-sm">{s.name || s._id}</li>))}
          </ul>
        </div>
        <div className="border rounded p-4 space-y-2">
          <div className="font-medium">Broadcast Announcement</div>
          <input className="border p-2 rounded w-full" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <textarea className="border p-2 rounded w-full" placeholder="Message" value={body} onChange={(e)=>setBody(e.target.value)} />
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={broadcast}>Send</button>
        </div>
      </div>
      <div className="border rounded p-4 space-y-2">
        <div className="font-medium">Upcoming Sessions</div>
        <ul className="space-y-1">
          {sessions.map((s:any)=> (<li key={s._id} className="text-sm">{new Date(s.startDateTime).toLocaleString()}</li>))}
        </ul>
      </div>
    </div>
  );
}

