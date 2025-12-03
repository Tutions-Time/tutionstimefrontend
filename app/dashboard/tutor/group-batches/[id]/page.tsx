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
  const [uploading, setUploading] = useState<string | null>(null);

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

  const join = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      const url = res.data?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Join failed");
      }
    } catch (e:any) {
      toast.error(e.message || "Join failed");
    }
  };

  const uploadFile = async (sessionId: string, kind: "recording" | "notes" | "assignment", file: File | null) => {
    if (!file) { toast.error("Select file"); return; }
    try {
      setUploading(`${sessionId}:${kind}`);
      const form = new FormData();
      form.append(kind, file);
      const endpoint = kind === "recording" ? "upload-recording" : kind === "notes" ? "upload-notes" : "upload-assignment";
      const res = await api.post(`/sessions/${sessionId}/${endpoint}`, form);
      if (res.data?.success) {
        toast.success("Uploaded");
        await load();
      } else {
        toast.error("Upload failed");
      }
    } catch (e:any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(null);
    }
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
      <div className="border rounded p-4 space-y-3">
        <div className="font-medium">Upcoming Sessions</div>
        <ul className="space-y-3">
          {sessions.map((s:any)=> (
            <li key={s._id} className="text-sm border rounded p-3">
              <div className="flex items-center justify-between">
                <div>{new Date(s.startDateTime).toLocaleString()}</div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={()=>join(s._id)}>Join</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                <div className="space-y-2">
                  <input type="file" onChange={(e)=>uploadFile(s._id, "recording", e.target.files?.[0]||null)} />
                  {s.recordingUrl && <a className="text-blue-600" href={s.recordingUrl} target="_blank">Recording</a>}
                </div>
                <div className="space-y-2">
                  <input type="file" onChange={(e)=>uploadFile(s._id, "notes", e.target.files?.[0]||null)} />
                  {s.notesUrl && <a className="text-blue-600" href={s.notesUrl} target="_blank">Notes</a>}
                </div>
                <div className="space-y-2">
                  <input type="file" onChange={(e)=>uploadFile(s._id, "assignment", e.target.files?.[0]||null)} />
                  {s.assignmentUrl && <a className="text-blue-600" href={s.assignmentUrl} target="_blank">Assignment</a>}
                </div>
              </div>
              {uploading === `${s._id}:recording` || uploading === `${s._id}:notes` || uploading === `${s._id}:assignment` ? (
                <div className="text-xs text-gray-500 mt-2">Uploading…</div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

