"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Video } from "lucide-react";
import { getRegularClassSessions, joinSession, createOrUpdateAssignment, getSessionAssignments, getAssignmentDownloadUrls } from "@/services/tutorService";
import { toast } from "@/hooks/use-toast";

export default function TutorRegularClassSessionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const rcId = Array.isArray(id) ? id[0] : (id as string);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentForm, setAssignmentForm] = useState<{ sessionId?: string; title: string; description?: string; dueDate?: string; files: File[] }>({ title: "", files: [] });
  const [assignmentData, setAssignmentData] = useState<Record<string, any>>({});

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await getRegularClassSessions(rcId);
      if (res.success) setSessions(res.data || []);
      else toast({ title: "Error", description: res.message });
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rcId) loadSessions();
  }, [rcId]);

  const loadAssignment = async (sessionId: string) => {
    try {
      const res = await getSessionAssignments(sessionId);
      setAssignmentData((prev) => ({ ...prev, [sessionId]: res.data || null }));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar title="Regular Class Sessions" subtitle="Manage sessions and assignments" />

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
                      else toast({ title: "Unable to join", description: res?.message || "Try near the scheduled time." });
                    } catch (e: any) {
                      toast({ title: "Join failed", description: e.message });
                    }
                  }}
                  className="bg-[#FFD54F] text-black"
                >
                  <Video className="w-4 h-4 mr-2" /> Join
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setAssignmentForm({ sessionId: s._id, title: assignmentForm.title, description: assignmentForm.description, dueDate: assignmentForm.dueDate, files: [] });
                    loadAssignment(s._id);
                  }}
                >
                  View/Create Assignment
                </Button>
              </div>

              {assignmentForm.sessionId === s._id && (
                <div className="mt-3 space-y-2">
                  <input
                    placeholder="Title"
                    className="w-full border p-2 rounded"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <textarea
                    placeholder="Description"
                    className="w-full border p-2 rounded"
                    value={assignmentForm.description || ""}
                    onChange={(e) => setAssignmentForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="border p-2 rounded"
                    value={assignmentForm.dueDate || ""}
                    onChange={(e) => setAssignmentForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setAssignmentForm((f) => ({ ...f, files: Array.from(e.target.files || []) }))}
                  />
                  <Button
                    onClick={async () => {
                      if (!assignmentForm.title) {
                        toast({ title: "Title required", description: "Please enter title" });
                        return;
                      }
                      try {
                        const res = await createOrUpdateAssignment(assignmentForm.sessionId!, {
                          title: assignmentForm.title,
                          description: assignmentForm.description,
                          dueDate: assignmentForm.dueDate,
                        }, assignmentForm.files);
                        toast({ title: "Assignment saved" });
                        loadAssignment(assignmentForm.sessionId!);
                      } catch (e: any) {
                        toast({ title: "Save failed", description: e.message });
                      }
                    }}
                  >
                    Save Assignment
                  </Button>

                  {assignmentData[s._id] && (
                    <div className="mt-2 text-sm">
                      <div>Existing: {assignmentData[s._id].title}</div>
                      <div>Due: {assignmentData[s._id].dueDate ? new Date(assignmentData[s._id].dueDate).toLocaleDateString("en-IN") : "-"}</div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}
