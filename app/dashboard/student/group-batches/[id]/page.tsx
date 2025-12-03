"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

export default function StudentBatchSessionsPage() {
  const enabled = String(process.env.NEXT_PUBLIC_FEATURE_GROUP_BATCHES || "false").toLowerCase() === "true";
  const params = useParams() as any;
  const id = params?.id as string;
  const [sessions, setSessions] = useState<any[]>([]);
  const [joining, setJoining] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get(`/group-batches/${id}/sessions`);
      setSessions(res.data?.data || []);
    } catch (e: any) {}
  };

  useEffect(() => { if (enabled && id) load(); }, [enabled, id]);

  const join = async (sessionId: string) => {
    try {
      setJoining(sessionId);
      const res = await api.post(`/sessions/${sessionId}/join`);
      const url = res.data?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Join failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Join failed");
    } finally {
      setJoining(null);
    }
  };

  if (!enabled) return <div className="p-6">Feature disabled</div>;

  const upcoming = sessions.filter((s: any) => s.status === "scheduled");
  const completed = sessions.filter((s: any) => s.status === "completed");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Group Batch Sessions</h1>

      <div className="border rounded p-4 space-y-3">
        <div className="font-medium">Upcoming</div>
        <ul className="space-y-3">
          {upcoming.map((s: any) => (
            <li key={s._id} className="text-sm border rounded p-3 flex items-center justify-between">
              <div>{new Date(s.startDateTime).toLocaleString()}</div>
              <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => join(s._id)}>
                {joining === s._id ? "Joining…" : "Join"}
              </button>
            </li>
          ))}
          {upcoming.length === 0 && <li className="text-sm text-gray-500">No upcoming sessions</li>}
        </ul>
      </div>

      <div className="border rounded p-4 space-y-3">
        <div className="font-medium">Materials</div>
        <ul className="space-y-3">
          {completed.map((s: any) => (
            <li key={s._id} className="text-sm border rounded p-3 space-y-2">
              <div className="text-xs text-gray-700">{new Date(s.startDateTime).toLocaleString()}</div>
              <div className="flex flex-wrap gap-3">
                {s.notesUrl && (
                  <a className="text-blue-600" href={s.notesUrl} target="_blank">Notes</a>
                )}
                {s.assignmentUrl && (
                  <a className="text-blue-600" href={s.assignmentUrl} target="_blank">Assignment</a>
                )}
                {s.recordingUrl && (
                  <a className="text-blue-600" href={s.recordingUrl} target="_blank">Recording</a>
                )}
                {!s.notesUrl && !s.assignmentUrl && !s.recordingUrl && (
                  <span className="text-gray-500">No materials</span>
                )}
              </div>
            </li>
          ))}
          {completed.length === 0 && <li className="text-sm text-gray-500">No completed sessions</li>}
        </ul>
      </div>
    </div>
  );
}

