"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import BookingList from "@/components/student/bookings/BookingList";
import { getStudentBookings } from "@/services/bookingService";
import { getStudentRegularClasses } from "@/services/studentService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Video } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { getRegularClassSessions, joinSession } from "@/services/tutorService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { submitSessionFeedback } from "@/services/progressService";
import { getRegularPaymentByClass, requestRefund, getStudentRefunds, previewRefund } from "@/services/studentService";
import { useNotificationRefresh } from "@/hooks/useNotificationRefresh";

export default function StudentBookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [regularClasses, setRegularClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"demo" | "regular">("demo");
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedRegularClassId, setSelectedRegularClassId] = useState<string | null>(null);

  // ✅ Feedback state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    teaching: 5,
    communication: 5,
    understanding: 5,
    comment: "",
  });
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundForm, setRefundForm] = useState<{ regularClassId?: string; paymentId?: string; reasonCode?: string; reasonText?: string; preview?: any }>({});

  const themePrimary = "#FFD54F";

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

  const load = useCallback(async () => {
    try {
      const [list, regular] = await Promise.all([
        getStudentBookings(),
        getStudentRegularClasses(),
      ]);
      setBookings(list);
      setRegularClasses(regular);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const isBookingsNotification = (detail: any) => {
    const title = String(detail?.data?.title || detail?.data?.message || "").toLowerCase();
    const meta = detail?.data?.meta || {};
    return (
      title.includes("demo") ||
      title.includes("payment") ||
      title.includes("refund") ||
      Boolean(meta.bookingId) ||
      Boolean(meta.regularClassId) ||
      Boolean(meta.paymentId) ||
      Boolean(meta.refundRequestId)
    );
  };

  useEffect(() => {
    load();
  }, [load]);

  useNotificationRefresh(() => {
    load();
  }, isBookingsNotification);

  // Filter bookings based on active tab
  const filtered = bookings.filter((b) => {
    const isTabMatch = b.type?.toLowerCase() === activeTab;
    if (!isTabMatch) return false;

    // Hide demo bookings that have an associated PAID regular class
    if (activeTab !== "demo") return true;

    const rc = regularClasses.find(
      (rc: any) => String(rc.regularClassId) === String(b.regularClassId)
    );

    if (!rc) return true;
    return rc.paymentStatus !== "paid";
  });

  const openSessionsModal = async (regularClassId: string) => {
    setSelectedRegularClassId(regularClassId);
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

  // ✅ Open feedback modal for a session
  const openFeedback = (sessionId: string) => {
    setFeedbackSessionId(sessionId);
    setFeedbackForm({
      teaching: 5,
      communication: 5,
      understanding: 5,
      comment: "",
    });
    setFeedbackOpen(true);
  };

  // ✅ Submit feedback
  const submitFeedback = async () => {
    if (!feedbackSessionId) return;
    try {
      setFeedbackSubmitting(true);
      const res = await submitSessionFeedback(feedbackSessionId, feedbackForm);
      if (res?.success) {
        setFeedbackOpen(false);
        // Update session list in memory to reflect feedback
        setSessions((prev) =>
          prev.map((s: any) =>
            s._id === feedbackSessionId ? { ...s, sessionFeedback: res.data } : s
          )
        );
      }
    } catch (e) {
      console.error("Error submitting feedback:", e);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // ============================================
  // JOIN BUTTON LOGIC — UNIVERSAL FUNCTION
  // ============================================
  const getJoinState = (startDateTime: string) => {
    const startMs = new Date(startDateTime).getTime();
    const nowMs = Date.now();

    const joinOpenAt = startMs - 5 * 60 * 1000; // 5 min before
    const joinCloseAt = startMs + 60 * 60 * 1000; // 1 hour after

    const isFuture = nowMs < joinOpenAt;
    const inJoinWindow = nowMs >= joinOpenAt && nowMs <= joinCloseAt;
    const isExpired = nowMs > joinCloseAt;

    return { isFuture, inJoinWindow, isExpired };
  };

  const formatDateRaw = (value: string) =>
    new Date(value).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

  const formatTimeRaw = (value: string) =>
    new Date(value).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

  return (
    <>
      <div
        className="min-h-screen bg-gray-50"
        style={{ ["--primary" as any]: themePrimary }}
      >
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
        <Sidebar
          userRole="student"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pl-64">
          <Topbar title="My Classes" subtitle="Track and manage your sessions" />

          <main className="p-4 lg:p-6">
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-[#FFD54F] via-amber-300 to-yellow-400 mb-4" />

            {/* TABS */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("demo")}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeTab === "demo"
                    ? "bg-[#FFD54F] text-black shadow-sm"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Demo Classes
              </button>

              <button
                onClick={() => setActiveTab("regular")}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeTab === "regular"
                    ? "bg-[#FFD54F] text-black shadow-sm"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Regular Classes
              </button>
            </div>

            {/* CONTENT */}
            {loading ? (
              <p className="text-center text-gray-500 mt-10">Loading your classes...</p>
            ) : activeTab === "demo" ? (
              <BookingList bookings={filtered} />
            ) : regularClasses.length === 0 ? (
              <Card className="p-6 text-center text-gray-500 bg-white/80 border border-dashed">
                No Regular Classes yet.
              </Card>
            ) : (
              <div className="grid gap-4">
                {regularClasses.map((rc: any) => {
                  const next = rc.nextSession;
                  const hasLink = !!next?.meetingLink;

                  let joinState = { isFuture: false, inJoinWindow: false, isExpired: false };
                  if (next) joinState = getJoinState(next.startDateTime);

                  return (
                    <Card
                      key={rc.regularClassId}
                      className="p-6 bg-white/80 rounded-2xl border shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <Avatar className="h-11 w-11 shadow-md">
                            <AvatarImage
                              src={getImageUrl(rc.tutor?.photoUrl)}
                              alt={rc.tutor?.name || "Tutor"}
                            />
                            <AvatarFallback>
                              {(rc.tutor?.name || "T").charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="font-semibold text-lg">{rc.tutor?.name}</div>
                            <div className="text-gray-600 text-sm">{rc.subject}</div>
                            <div className="text-xs text-gray-400 mt-1">Regular Class</div>

                            {next && (
                              <div className="text-gray-500 text-sm flex items-center gap-3 mt-3">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-4 h-4" />
                                  {formatDateRaw(next.startDateTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTimeRaw(next.startDateTime)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Badge className="bg-[#FFD54F] text-black shadow-sm">
                          {rc.scheduleStatus === "scheduled"
                            ? "Scheduled"
                            : "Not Scheduled"}
                        </Badge>
                      </div>

                      {hasLink && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {/* JOIN BUTTON (never hidden, just disabled when outside window) */}
                          {!joinState.isExpired && (
                            <Button
                              onClick={() =>
                                joinState.inJoinWindow &&
                                window.open(next.meetingLink, "_blank")
                              }
                              disabled={!joinState.inJoinWindow}
                              className="bg-[#FFD54F] text-black font-semibold rounded-full px-5 shadow-md hover:shadow-lg"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              {joinState.inJoinWindow
                                ? "Join Now"
                                : "Join (available soon)"}
                            </Button>
                          )}

                          {/* VIEW SESSIONS */}
                          <Button
                            onClick={() => openSessionsModal(rc.regularClassId)}
                            className="bg-white text-gray-700 border rounded-full px-5"
                          >
                            View Sessions
                          </Button>

                          {/* REQUEST REFUND */}
                          <Button
                            onClick={async () => {
                              try {
                                const p = await getRegularPaymentByClass(rc.regularClassId);
                                if (!p?._id) {
                                  alert("No payment found for this class");
                                  return;
                                }
                                setRefundForm({ regularClassId: rc.regularClassId, paymentId: p._id });
                                setRefundModalOpen(true);
                              } catch {
                                alert("Unable to load payment");
                              }
                            }}
                            className="bg-white text-gray-700 border rounded-full px-5"
                          >
                            Request Refund
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* SESSIONS MODAL */}
      <Dialog
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" />

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="p-6 pb-3 border-b">
              <Dialog.Title className="text-lg font-semibold">Sessions</Dialog.Title>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {sessionsLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center text-gray-500">No sessions found.</div>
              ) : (
                sessions.map((s: any) => {
                  const startMs = new Date(s.startDateTime).getTime();
                  const nowMs = Date.now();

                  const joinOpenAt = startMs - 5 * 60 * 1000;
                  const joinCloseAt = startMs + 60 * 60 * 1000;

                  const inJoinWindow = nowMs >= joinOpenAt && nowMs <= joinCloseAt;
                  const isExpired = nowMs > joinCloseAt;

                  return (
                    <div key={s._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(s.startDateTime).toLocaleDateString("en-IN", {
                              timeZone: "UTC",
                            })}
                          </div>
                          <div>
                            {new Date(s.startDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">{s.status}</div>
                        </div>

                        {!isExpired && (
                          <Button
                            onClick={async () => {
                              if (!inJoinWindow) return;
                              try {
                                const res = await joinSession(s._id);
                                if (res?.success && res?.url)
                                  window.open(res.url, "_blank");
                              } catch {}
                            }}
                            disabled={!inJoinWindow}
                            className="bg-[#FFD54F] text-black px-3 py-2 rounded-full text-sm"
                          >
                            {inJoinWindow ? "Join Now" : "Join (available soon)"}
                          </Button>
                        )}
                      </div>

                      {/* FILE DOWNLOADS + FEEDBACK */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {s.notesUrl && (
                          <Button
                            className="bg-[#FFD54F] text-black text-xs rounded-full px-4 py-2 shadow-sm"
                            onClick={() => window.open(s.notesUrl, "_blank")}
                          >
                            📘Notes
                          </Button>
                        )}

                        {s.assignmentUrl && (
                          <Button
                            className="bg-[#FFD54F] text-black text-xs rounded-full px-4 py-2 shadow-sm"
                            onClick={() => window.open(s.assignmentUrl, "_blank")}
                          >
                            📝Assignment
                          </Button>
                        )}

                        {s.recordingUrl && (
                          <Button
                            className="bg-[#FFD54F] text-black text-xs rounded-full px-4 py-2 shadow-sm"
                            onClick={() => window.open(s.recordingUrl, "_blank")}
                          >
                            🎥Recording
                          </Button>
                        )}

                        {/* ✅ GIVE FEEDBACK BUTTON (ONLY FOR COMPLETED & NO FEEDBACK YET) */}
                        {s.status === "completed" && !s.sessionFeedback && (
                          <Button
                            className="bg-white border text-gray-700 text-xs rounded-full px-4 py-2"
                            onClick={() => openFeedback(s._id)}
                          >
                            ⭐ Give Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* FEEDBACK MODAL */}
      <Dialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <Dialog.Title className="text-lg font-semibold">
                Session Feedback
              </Dialog.Title>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm">Teaching</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={feedbackForm.teaching}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        teaching: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-sm">Communication</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={feedbackForm.communication}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        communication: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-sm">Understanding</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={feedbackForm.understanding}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        understanding: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full border rounded px-2 py-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm">Comment</label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      comment: e.target.value,
                    })
                  }
                  className="mt-1 w-full border rounded px-2 py-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setFeedbackOpen(false)}
                  variant="outline"
                  className="border"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitFeedback}
                  disabled={feedbackSubmitting}
                  className="bg-[#FFD54F] text-black"
                >
                  {feedbackSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* REFUND MODAL */}
      <Dialog
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <Dialog.Title className="text-lg font-semibold">
                Request Refund
              </Dialog.Title>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600">Reason</label>
                <select
                  value={refundForm.reasonCode || ""}
                  onChange={async (e) => {
                    const code = e.target.value;
                    const next = { ...refundForm, reasonCode: code };
                    setRefundForm(next);
                    if (refundForm.paymentId && code) {
                      try {
                        const pv = await previewRefund({ paymentId: String(refundForm.paymentId), reasonCode: code, reasonText: next.reasonText || undefined });
                        setRefundForm((f) => ({ ...f, preview: pv }));
                      } catch {}
                    }
                  }}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="" disabled>Select reason</option>
                  <option value="CLASS_NOT_CONDUCTED">Class not conducted</option>
                  <option value="TUTOR_ABSENT_OR_LATE">Tutor absent or late</option>
                  <option value="WRONG_PURCHASE">Wrong purchase</option>
                  <option value="QUALITY_ISSUE">Quality issue</option>
                  <option value="TECHNICAL_ISSUE">Technical issue</option>
                  <option value="SCHEDULE_CONFLICT">Schedule conflict</option>
                  <option value="CONTENT_NOT_AS_DESCRIBED">Content not as described</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                {refundForm.reasonCode === "OTHER" && (
                  <textarea
                    value={refundForm.reasonText || ""}
                    onChange={async (e) => {
                      const txt = e.target.value;
                      setRefundForm((f) => ({ ...f, reasonText: txt }));
                      if (refundForm.paymentId && refundForm.reasonCode) {
                        try {
                          const pv = await previewRefund({ paymentId: String(refundForm.paymentId), reasonCode: String(refundForm.reasonCode), reasonText: txt });
                          setRefundForm((f) => ({ ...f, preview: pv }));
                        } catch {}
                      }
                    }}
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    rows={3}
                  />
                )}
                {refundForm.preview && (
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>Completion: {Math.round((refundForm.preview.completionPercentage || 0) * 100)}%</div>
                    <div>Refundable: {Math.round((refundForm.preview.refundablePercentage || 0) * 100)}%</div>
                    <div>Max Amount: ₹{refundForm.preview.maximumRefundableAmount || 0}</div>
                    <div>{refundForm.preview.explanation || ""}</div>
                    <div>Window: {refundForm.preview.refundWindowValid ? "Valid" : "Expired"}</div>
                    <div>Method: {refundForm.preview.suggestedRefundMethod}</div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  className="bg-white text-gray-700 border rounded-full px-5"
                  onClick={() => setRefundModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#FFD54F] text-black font-semibold rounded-full px-5"
                  onClick={async () => {
                    try {
                      if (!refundForm.paymentId || !refundForm.reasonCode) return;
                      const res = await requestRefund({ paymentId: String(refundForm.paymentId), reasonCode: String(refundForm.reasonCode), reasonText: refundForm.reasonText || undefined });
                      if (res?.success) {
                        alert("Refund requested");
                        try {
                          await getStudentRefunds(); // optional refresh
                        } catch {}
                        setRefundModalOpen(false);
                        setRefundForm({});
                      } else {
                        alert(res?.message || "Refund request failed");
                      }
                    } catch {
                      alert("Refund request failed");
                    }
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
