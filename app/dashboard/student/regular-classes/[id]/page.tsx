"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Video, Download } from "lucide-react";
import { joinSession, getSessionAssignments, getAssignmentDownloadUrls, submitAssignment } from "@/services/studentService";
import { toast } from "@/hooks/use-toast";
import { getRegularClassSessions } from "@/services/tutorService";

export default function StudentRegularClassSessionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const rcId = Array.isArray(id) ? id[0] : (id as string);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, any>>({});
  const [submissionFiles, setSubmissionFiles] = useState<Record<string, File[]>>({});

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await getRegularClassSessions(rcId);
      if (res.success) setSessions(res.data || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rcId) loadSessions();
  }, [rcId]);

  const openAssignment = async (sessionId: string) => {
    try {
      const res = await getSessionAssignments(sessionId);
      setAssignments((prev) => ({ ...prev, [sessionId]: res.data || null }));
    } catch {}
  };

  const downloadAll = async (sessionId: string) => {
    try {
      const a = assignments[sessionId];
      if (!a) return;
      const res = await getAssignmentDownloadUrls(a._id);
      const urls = res?.data?.tutorFiles || [];
      urls.forEach((u: string) => window.open(u, "_blank"));
    } catch (e: any) {
      toast({ title: "Download failed", description: e.message });
    }
  };

  const submit = async (sessionId: string) => {
    try {
      const a = assignments[sessionId];
      const files = submissionFiles[sessionId] || [];
      if (!a || !files.length) {
        toast({ title: "Select files first" });
        return;
      }
      await submitAssignment(a._id, files);
      toast({ title: "Submitted" });
      openAssignment(sessionId);
    } catch (e: any) {
      toast({ title: "Submit failed", description: e.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Regular Class Sessions" subtitle="Join and manage assignments" />
        <main className="p-4 lg:p-6 space-y-4">
          {loading && <div className="text-center text-muted py-10">Loading sessions...</div>}
          {!loading && sessions.length === 0 && <Card className="p-6">No sessions found.</Card>}
          {!loading && sessions.map((s) => (
            <Card key={s._id} className="p-6 space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(s.startDateTime).toLocaleDateString("en-IN")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(s.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span>Status: {s.status}</span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    try {
                      const res = await joinSession(s._id);
                      if (res?.success && res?.url) window.open(res.url, "_blank");
                    } catch (e: any) {
                      toast({ title: "Join failed", description: e.message });
                    }
                  }}
                  className="bg-[#FFD54F] text-black"
                >
                  <Video className="w-4 h-4 mr-2" /> Join
                </Button>

                <Button variant="outline" onClick={() => openAssignment(s._id)}>Assignment</Button>
              </div>

              {assignments[s._id] && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="font-semibold">{assignments[s._id].title}</div>
                  <div>{assignments[s._id].description}</div>
                  <div>
                    Due: {assignments[s._id].dueDate ? new Date(assignments[s._id].dueDate).toLocaleDateString("en-IN") : "-"}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => downloadAll(s._id)}>
                      <Download className="w-4 h-4 mr-2" /> Download files
                    </Button>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setSubmissionFiles((prev) => ({ ...prev, [s._id]: Array.from(e.target.files || []) }))}
                    />
                    <Button onClick={() => submit(s._id)}>Submit</Button>
                  </div>
                  <div>Status: {assignments[s._id].status}</div>
                </div>
              )}
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}
