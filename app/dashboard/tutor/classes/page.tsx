"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, BookOpen, Clock, Video } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTutorRegularClasses, scheduleRegularClass, getRegularClassSessions, joinSession, uploadSessionRecording, uploadSessionNotes, uploadSessionAssignment, completeSession } from "@/services/tutorService";
import { toast } from "@/hooks/use-toast";
import { Dialog } from "@headlessui/react";

export default function TutorRegularClasses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"scheduled" | "not-scheduled">("scheduled");

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [timeValue, setTimeValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const openScheduleModal = (regularClassId: string) => {
    setSelectedClassId(regularClassId);
    setModalOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!timeValue) {
      toast({ title: "Time required", description: "Please select a time." });
      return;
    }

    try {
      const response = await scheduleRegularClass(selectedClassId!, {
        time: timeValue,
      });

      toast({ title: "Success", description: "Class scheduled successfully!" });
      setModalOpen(false);
      loadClasses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

  const openSessionsModal = async (regularClassId: string) => {
    setSelectedClassId(regularClassId);
    setSessionsModalOpen(true);
    try {
      setSessionsLoading(true);
      const res = await getRegularClassSessions(regularClassId);
      setSessions(res.success ? (res.data || []) : []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await getTutorRegularClasses();

      if (res.success) setClasses(res.data || []);
      else toast({ title: "Error", description: res.message });
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const scheduledClasses = classes.filter((c) => c.scheduleStatus === "scheduled");
  const notScheduledClasses = classes.filter((c) => c.scheduleStatus === "not-scheduled");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar title="Regular Classes" subtitle="Your active regular class students" />

        {/* Tabs */}
        <div className="px-4 lg:px-6 mt-4 flex gap-3">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "scheduled" ? "bg-[#FFD54F] text-white" : "bg-white border"
            }`}
          >
            Scheduled Classes
          </button>

          <button
            onClick={() => setActiveTab("not-scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "not-scheduled" ? "bg-[#FFD54F] text-white" : "bg-white border"
            }`}
          >
            Not Scheduled
          </button>
        </div>

        <main className="p-4 lg:p-6 space-y-4">
          {loading && (
            <div className="text-center text-muted py-10 animate-pulse">
              Loading regular classes...
            </div>
          )}

          {/* Scheduled Tab */}
          {!loading && activeTab === "scheduled" && scheduledClasses.length === 0 && (
            <Card className="p-6 text-center text-muted">No scheduled classes.</Card>
          )}

          {!loading &&
            activeTab === "scheduled" &&
            scheduledClasses.map((c) => (
              <Card key={c.regularClassId} className="p-6 bg-white rounded-2xl shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={getImageUrl(c.student?.photoUrl || c.photoUrl)} alt={c.student?.name || c.studentName || "Student"} />
                        <AvatarFallback>{(c.student?.name || c.studentName || "S").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-lg">{c.student?.name || c.studentName}</div>
                    </div>

                    <div className="text-gray-600 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {c.subject}
                    </div>

                    {c.nextSession && (
                      <div className="text-gray-500 text-sm flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {new Date(c.nextSession.startDateTime).toLocaleDateString("en-IN")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(c.nextSession.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                  </div>

                  <Badge className="bg-[#FFD54F] text-black border-white">Scheduled</Badge>
                </div>

                {c.nextSession?.meetingLink && (
                  <div className="mt-4">
                    <button
                      onClick={() => window.open(c.nextSession.meetingLink, "_blank")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${c.nextSession.canJoin ? "bg-[#FFD54F] text-black" : "bg-gray-200 text-gray-600"}`}
                      disabled={!c.nextSession.canJoin}
                      title={c.nextSession.canJoin ? "Join session" : "Join opens 5 min before and closes 5 min after"}
                    >
                      <Video className="w-4 h-4 inline-block mr-2" />
                      {c.nextSession.canJoin ? "Join" : "Join (available soon)"}
                    </button>
                    <button
                      onClick={() => openSessionsModal(c.regularClassId)}
                      className="ml-3 px-4 py-2 border rounded-lg text-sm"
                    >
                      View Sessions
                    </button>
                  </div>
                )}
              </Card>
            ))}

          {/* Not Scheduled Tab */}
          {!loading && activeTab === "not-scheduled" && notScheduledClasses.length === 0 && (
            <Card className="p-6 text-center text-muted">All classes are scheduled.</Card>
          )}

          {!loading &&
            activeTab === "not-scheduled" &&
            notScheduledClasses.map((c) => (
              <Card key={c.regularClassId} className="p-6 bg-white rounded-2xl shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {c.studentName}
                    </div>

                    <div className="text-gray-600 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {c.subject}
                    </div>

                    <div className="text-gray-500 text-sm flex items-center gap-2 mt-2">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(c.startDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  <Badge className="bg-[#FFD54F] text-red-700 border-red-200">Not Scheduled</Badge>
                </div>

                {/* Schedule button */}
                <button
                  onClick={() => openScheduleModal(c.regularClassId)}
                  className="mt-4 px-4 py-2 bg-[#FFD54F] text-text font-bold rounded-lg text-sm"
                >
                  Schedule Time
                </button>
              </Card>
            ))}
        </main>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-40"></div>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
            <Dialog.Title className="text-lg font-semibold">Schedule Class</Dialog.Title>

            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />

            <button
              onClick={handleScheduleSubmit}
              className="w-full bg-[#FFD54F] text-white py-2 rounded-lg"
            >
              Save
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={sessionsModalOpen} onClose={() => setSessionsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-40"></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg space-y-4">
            <Dialog.Title className="text-lg font-semibold">Sessions</Dialog.Title>
            {sessionsLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-gray-500">No sessions found.</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => {
                  const start = new Date(s.startDateTime);
                  const startMs = start.getTime();
                  const classDurationMin = 60;
                  const joinBeforeMin = 5;
                  const expireAfterMin = 5;
                  const endMs = startMs + classDurationMin * 60 * 1000;
                  const joinOpenAt = startMs - joinBeforeMin * 60 * 1000;
                  const joinCloseAt = endMs + expireAfterMin * 60 * 1000;
                  const nowMs = Date.now();
                  const canJoin = nowMs >= joinOpenAt && nowMs <= joinCloseAt;
                  return (
                    <div key={s._id} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div>{start.toLocaleDateString("en-IN")}</div>
                          <div>{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                          <div className="text-xs text-gray-500">{s.status}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await joinSession(s._id);
                                if (res?.success && res?.url) window.open(res.url, "_blank");
                              } catch {}
                            }}
                            disabled={!canJoin}
                            className={`px-3 py-2 rounded-lg text-sm ${canJoin ? "bg-[#FFD54F] text-black" : "bg-gray-200 text-gray-600"}`}
                          >
                            Join Now
                          </button>
                        </div>
                      </div>

                      {s.status === "completed" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="border rounded-lg p-2 text-sm">
                            <div className="font-medium">Recording</div>
                            {s.recordingUrl ? (
                              <a href={s.recordingUrl} target="_blank" rel="noreferrer" className="text-primary text-xs">View</a>
                            ) : (
                              <label className="text-xs block">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploading((u) => ({ ...u, [s._id]: true }));
                                    try {
                                      await uploadSessionRecording(s._id, file);
                                      const res = await getRegularClassSessions(selectedClassId!);
                                      setSessions(res.success ? (res.data || []) : []);
                                    } catch {}
                                    setUploading((u) => ({ ...u, [s._id]: false }));
                                  }}
                                />
                              </label>
                            )}
                          </div>
                          <div className="border rounded-lg p-2 text-sm">
                            <div className="font-medium">Notes</div>
                            {s.notesUrl ? (
                              <a href={s.notesUrl} target="_blank" rel="noreferrer" className="text-primary text-xs">View</a>
                            ) : (
                              <label className="text-xs block">
                                <input
                                  type="file"
                                  accept="application/pdf,.doc,.docx,.txt,image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploading((u) => ({ ...u, [s._id]: true }));
                                    try {
                                      await uploadSessionNotes(s._id, file);
                                      const res = await getRegularClassSessions(selectedClassId!);
                                      setSessions(res.success ? (res.data || []) : []);
                                    } catch {}
                                    setUploading((u) => ({ ...u, [s._id]: false }));
                                  }}
                                />
                              </label>
                            )}
                          </div>
                          <div className="border rounded-lg p-2 text-sm">
                            <div className="font-medium">Assignment</div>
                            {s.assignmentUrl ? (
                              <a href={s.assignmentUrl} target="_blank" rel="noreferrer" className="text-primary text-xs">Download</a>
                            ) : (
                              <label className="text-xs block">
                                <input
                                  type="file"
                                  accept="application/pdf,.doc,.docx,.txt,image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploading((u) => ({ ...u, [s._id]: true }));
                                    try {
                                      await uploadSessionAssignment(s._id, file);
                                      const res = await getRegularClassSessions(selectedClassId!);
                                      setSessions(res.success ? (res.data || []) : []);
                                    } catch {}
                                    setUploading((u) => ({ ...u, [s._id]: false }));
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}


                      {s.status !== "completed" && (
                        <div className="flex items-center justify-end">
                          {/* <button
                            className="px-3 py-2 rounded-lg text-sm border"
                            onClick={async () => {
                              try {
                                await completeSession(s._id);
                                const res = await getRegularClassSessions(selectedClassId!);
                                setSessions(res.success ? (res.data || []) : []);
                              } catch {}
                            }}
                          >
                            Mark Completed
                          </button> */}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
  const IMAGE_BASE =
    process.env.NEXT_PUBLIC_IMAGE_URL ||
    (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000").replace("/api", "");

  const getImageUrl = (photoUrl?: string | null) => {
    if (!photoUrl) return "/default-avatar.png";
    const p = String(photoUrl);
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    const cleaned = p
      .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
      .replace(/\\/g, "/")
      .replace(/^.*uploads\//, "uploads/");
    const base = (IMAGE_BASE || "").replace(/\/$/, "");
    const rel = cleaned.replace(/^\//, "");
    return `${base}/${rel}`;
  };
