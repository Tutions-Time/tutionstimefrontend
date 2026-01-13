"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarClock, Notebook, PlayCircle, Star, Users, Wallet } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getTutorJourney } from "@/services/adminService";
import { cn } from "@/lib/utils";

type StudentInfo = {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string | null;
  altPhone?: string;
};

type BatchInfo = {
  id?: string;
  subject?: string;
  batchType?: string;
  status?: string;
  batchStartDate?: string;
  batchEndDate?: string;
  seatCap?: number;
  enrolledCount?: number;
  students?: StudentInfo[];
};

type NoteItem = {
  title?: string;
  subject?: string;
  classLevel?: string;
  board?: string;
  price?: number;
  createdAt?: string;
};

type JourneyData = {
  tutor: {
    id: string;
    profileId?: string;
    name: string;
    email: string;
    phone: string;
    rating?: number;
    status: string;
    joinedAt?: string;
  };
  demos: { total: number; pending: number; confirmed: number; cancelled: number; completed: number; converted: number };
  sessions: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    group: { total: number; scheduled: number; completed: number; cancelled: number };
  };
  regularClasses: { total: number; active: number; paused: number; ended: number };
  batches: { total: number; active: number; cancelled: number };
  notes: { total: number };
  payments: { revenue: number; payouts: number; refunds: number };
  recent: {
    demos: Array<{
      subject?: string;
      status?: string;
      preferredDate?: string;
      preferredTime?: string;
      regularClassId?: string;
      createdAt?: string;
      note?: string;
      student?: StudentInfo | null;
    }>;
    sessions: Array<{
      status?: string;
      startDateTime?: string;
      groupBatchId?: string;
      regularClassId?: string;
      createdAt?: string;
      student?: StudentInfo | null;
      batch?: BatchInfo | null;
    }>;
    batches: Array<{
      subject?: string;
      batchType?: string;
      status?: string;
      batchStartDate?: string;
      batchEndDate?: string;
      seatCap?: number;
      enrolledCount?: number;
      students?: StudentInfo[];
      createdAt?: string;
    }>;
    payments: Array<{
      type?: string;
      status?: string;
      amount?: number;
      currency?: string;
      refundTotal?: number;
      createdAt?: string;
      reason?: string;
      student?: StudentInfo | null;
    }>;
    notes: NoteItem[];
  };
};

export default function TutorJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = useMemo(() => (params?.id ? String(params.id) : ""), [params]);
  const section = useMemo(
    () => (searchParams?.get("section") || "").toLowerCase(),
    [searchParams]
  );
  const activeSection = useMemo(() => {
    const allowed = ["demos", "sessions", "batches", "payments", "notes"];
    return allowed.includes(section) ? section : "";
  }, [section]);
  const isAllView = Boolean(activeSection);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JourneyData | null>(null);
  const [sessionTab, setSessionTab] = useState<"one" | "batch">("one");

  useEffect(() => {
    const fetchData = async () => {
      if (!tutorId) return;
      try {
        setLoading(true);
        const params = isAllView ? { section: activeSection, limit: "all" as const } : undefined;
        const res = await getTutorJourney(tutorId, params);
        if (res.success) {
          setData(res.data);
        } else {
          toast({
            title: "Failed to load journey",
            description: res.message || "Unknown error",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Error loading journey",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tutorId, activeSection, isAllView]);

  const formatDate = (v?: string) => {
    if (!v) return "-";
    return new Date(v).toLocaleDateString();
  };

  const formatDateTime = (v?: string) => {
    if (!v) return "-";
    return new Date(v).toLocaleString();
  };

  const formatMoney = (n?: number) => `₹${(Number(n || 0)).toLocaleString("en-IN")}`;

  const statusTone = (status?: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "created":
        return "bg-indigo-100 text-indigo-900 border border-indigo-200";
      case "pending":
        return "bg-amber-100 text-amber-900 border border-amber-200";
      case "confirmed":
      case "approved":
      case "active":
      case "settled":
      case "paid":
      case "completed":
        return "bg-emerald-100 text-emerald-900 border border-emerald-200";
      case "scheduled":
        return "bg-blue-100 text-blue-900 border border-blue-200";
      case "cancelled":
      case "rejected":
      case "failed":
        return "bg-rose-100 text-rose-900 border border-rose-200";
      case "paused":
        return "bg-yellow-100 text-yellow-900 border border-yellow-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const renderRatingStars = (rating?: number) => {
    const safe = Number.isFinite(rating) ? Math.max(0, Math.min(5, Number(rating))) : 0;
    const full = Math.floor(safe);
    const half = safe - full >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i < full;
          const halfActive = !active && half && i === full;
          return (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                active ? "text-yellow-500 fill-yellow-500" : halfActive ? "text-yellow-500" : "text-slate-300"
              )}
            />
          );
        })}
        <span className="text-xs text-muted ml-1">{safe.toFixed(1)}</span>
      </div>
    );
  };

  const formatStudentLabel = (student?: StudentInfo | null) => {
    if (!student) return "Unknown Student";
    const parts = [student.name || "Unknown Student"];
    if (student.phone) parts.push(student.phone);
    if (student.email) parts.push(student.email);
    return parts.join(" | ");
  };

  const formatStudentNames = (students?: StudentInfo[]) => {
    if (!students?.length) return "No students";
    return students.map((s) => s.name || "Unknown").join(", ");
  };

  const sectionTitles: Record<string, string> = {
    demos: "All Demos",
    sessions: "All Sessions",
    batches: "All Batches",
    payments: "All Payments",
    notes: "All Notes",
  };

  const openSection = (name: string) => {
    if (!tutorId) return;
    router.push(`/dashboard/admin/tutors/${tutorId}/journey?section=${name}`);
  };

  const closeAllView = () => {
    if (!tutorId) return;
    router.push(`/dashboard/admin/tutors/${tutorId}/journey`);
  };

  const showDemos = !isAllView || activeSection === "demos";
  const showSessions = !isAllView || activeSection === "sessions";
  const showBatches = !isAllView || activeSection === "batches";
  const showPayments = !isAllView || activeSection === "payments";
  const showNotes = !isAllView || activeSection === "notes";
  const sessionItems = data?.recent.sessions || [];
  const oneToOneSessions = sessionItems.filter((s) => !s.groupBatchId);
  const batchSessions = sessionItems.filter((s) => s.groupBatchId);
  const showSessionTabs = showSessions;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={0}
        userRole="admin"
        userName="Admin"
      />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title={isAllView ? sectionTitles[activeSection] || "Tutor Journey" : "Tutor Journey"}
          subtitle={
            isAllView
              ? "Full list for this tutor"
              : "Full lifecycle: demos, sessions, batches, notes, payments"
          }
          greeting={false}
          actionPosition="left"
          action={
            <Button
              variant="outline"
              size="icon"
              onClick={() => (isAllView ? closeAllView() : router.back())}
              aria-label={isAllView ? "Back to journey" : "Back"}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {loading ? (
            <Card className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            </Card>
          ) : data ? (
            <>
              <Card className="p-6 rounded-2xl shadow-sm bg-gradient-to-r from-amber-50 via-white to-blue-50 border border-amber-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-lg font-semibold shadow-inner">
                      {data.tutor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-text">{data.tutor.name}</div>
                      <div className="text-sm text-muted">{data.tutor.email || "No email"}</div>
                      <div className="text-sm text-muted">{data.tutor.phone || "No phone"}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-indigo-200 text-indigo-900 bg-indigo-50">
                      {renderRatingStars(data.tutor.rating)}
                    </Badge>
                    <Badge variant="outline" className="capitalize border-amber-200 text-amber-900 bg-amber-50">
                      Status: {data.tutor.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-900 bg-blue-50">
                      Joined: {formatDate(data.tutor.joinedAt)}
                    </Badge>
                  </div>
                </div>
              </Card>

              {!isAllView ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="p-4 rounded-xl shadow-sm bg-gradient-to-br from-amber-50 via-white to-white border border-amber-100">
                  <div className="flex items-center gap-2 text-sm text-muted mb-2">
                    <PlayCircle className="w-4 h-4" />
                    Demos
                  </div>
                  <div className="text-2xl font-semibold text-text">
                    {data.demos.completed} / {data.demos.total} completed
                  </div>
                  <div className="text-sm text-muted mt-1">
                    {data.demos.converted} converted to regular
                  </div>
                </Card>

                <Card className="p-4 rounded-xl shadow-sm bg-gradient-to-br from-blue-50 via-white to-white border border-blue-100">
                  <div className="flex items-center gap-2 text-sm text-muted mb-2">
                    <CalendarClock className="w-4 h-4" />
                    Sessions
                  </div>
                  <div className="text-2xl font-semibold text-text">
                    {data.sessions.completed} / {data.sessions.total} completed
                  </div>
                  <div className="text-sm text-muted mt-1">
                    Group: {data.sessions.group.completed} / {data.sessions.group.total}
                  </div>
                </Card>

                <Card className="p-4 rounded-xl shadow-sm bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100">
                  <div className="flex items-center gap-2 text-sm text-muted mb-2">
                    <Users className="w-4 h-4" />
                    Classes & Batches
                  </div>
                  <div className="text-2xl font-semibold text-text">
                    {data.regularClasses.active} active classes
                  </div>
                  <div className="text-sm text-muted mt-1">
                    Batches: {data.batches.active} active / {data.batches.total} total
                  </div>
                </Card>

                <Card className="p-4 rounded-xl shadow-sm bg-gradient-to-br from-rose-50 via-white to-white border border-rose-100">
                  <div className="flex items-center gap-2 text-sm text-muted mb-2">
                    <Wallet className="w-4 h-4" />
                    Payments
                  </div>
                  <div className="text-2xl font-semibold text-text">{formatMoney(data.payments.revenue)}</div>
                  <div className="text-sm text-muted mt-1">
                    Payouts {formatMoney(data.payments.payouts)} - Refunds {formatMoney(data.payments.refunds)}
                  </div>
                </Card>
                </div>
              ) : null}

              {showDemos || showSessions ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {showDemos ? (
                  <Card className="p-4 rounded-xl bg-white shadow-sm border border-amber-100/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-text">{isAllView ? "All Demos" : "Recent Demos"}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Total {data.demos.total}</Badge>
                        {!isAllView ? (
                          <Button variant="ghost" size="sm" onClick={() => openSection("demos")}>
                            See all
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  <div className="space-y-3">
                    {data.recent.demos.length === 0 ? (
                      <div className="text-sm text-muted">No demos yet.</div>
                    ) : (
                      data.recent.demos.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-text">{d.subject || "Demo"}</div>
                            <div className="text-xs text-muted">Student: {formatStudentLabel(d.student)}</div>
                            <div className="text-xs text-muted">
                              Preferred: {formatDate(d.preferredDate)} {d.preferredTime || ""}
                            </div>
                            {d.note ? <div className="text-xs text-muted">Note: {d.note}</div> : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("capitalize", statusTone(d.status))}>
                              {d.status}
                            </Badge>
                            {d.regularClassId ? (
                              <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-200">
                                Converted
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  </Card>
                  ) : null}

                  {showSessions ? (
                  <Card className="p-4 rounded-xl bg-white shadow-sm border border-blue-100/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-text">{isAllView ? "All Sessions" : "Recent Sessions"}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Total {data.sessions.total}</Badge>
                        {!isAllView ? (
                          <Button variant="ghost" size="sm" onClick={() => openSection("sessions")}>
                            See all
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  {showSessionTabs ? (
                    <>
                      <div className="flex justify-center mb-3">
                        <div className="flex p-2 bg-white/60 rounded-full border gap-1">
                          <button
                            onClick={() => setSessionTab("one")}
                            className={`px-6 py-2 text-sm font-medium rounded-full ${
                              sessionTab === "one"
                                ? "bg-white shadow text-blue-700"
                                : "text-gray-600"
                            }`}
                          >
                            1:1 Sessions
                          </button>
                          <button
                            onClick={() => setSessionTab("batch")}
                            className={`px-6 py-2 text-sm font-medium rounded-full ${
                              sessionTab === "batch"
                                ? "bg-white shadow text-blue-700"
                                : "text-gray-600"
                            }`}
                          >
                            Batch Sessions
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {sessionTab === "one" ? (
                          oneToOneSessions.length === 0 ? (
                            <div className="text-sm text-muted">No 1:1 sessions yet.</div>
                          ) : (
                            oneToOneSessions.map((s, idx) => (
                              <div key={`one-${idx}`} className="flex items-center justify-between border rounded-lg p-3">
                                <div>
                                  <div className="font-medium text-text">{formatDateTime(s.startDateTime)}</div>
                                  <div className="text-xs text-muted">
                                    1:1 - {s.regularClassId ? "Regular" : "Demo/Adhoc"}
                                  </div>
                                  {s.student ? (
                                    <div className="text-xs text-muted">Student: {formatStudentLabel(s.student)}</div>
                                  ) : (
                                    <div className="text-xs text-muted">Student: -</div>
                                  )}
                                </div>
                                <Badge className={cn("capitalize", statusTone(s.status))}>
                                  {s.status}
                                </Badge>
                              </div>
                            ))
                          )
                        ) : batchSessions.length === 0 ? (
                          <div className="text-sm text-muted">No batch sessions yet.</div>
                        ) : (
                          batchSessions.map((s, idx) => (
                            <div key={`batch-${idx}`} className="flex items-center justify-between border rounded-lg p-3">
                              <div>
                                <div className="font-medium text-text">{formatDateTime(s.startDateTime)}</div>
                                <div className="text-xs text-muted">
                                  Group - {s.regularClassId ? "Regular" : "Demo/Adhoc"}
                                </div>
                                {s.batch ? (
                                  <div className="text-xs text-muted">
                                    Batch: {s.batch.subject || "Batch"} | Students: {formatStudentNames(s.batch.students)}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted">Batch: -</div>
                                )}
                              </div>
                              <Badge className={cn("capitalize", statusTone(s.status))}>
                                {s.status}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : null}
                  </Card>
                  ) : null}
                </div>
              ) : null}

              {showBatches || showPayments ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {showBatches ? (
                  <Card className="p-4 rounded-xl bg-white shadow-sm border border-emerald-100/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-text">{isAllView ? "All Batches" : "Recent Batches"}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Total {data.batches.total}</Badge>
                        {!isAllView ? (
                          <Button variant="ghost" size="sm" onClick={() => openSection("batches")}>
                            See all
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  <div className="space-y-3">
                    {data.recent.batches.length === 0 ? (
                      <div className="text-sm text-muted">No batches yet.</div>
                    ) : (
                      data.recent.batches.map((b, idx) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-text">{b.subject || "Batch"}</div>
                            <div className="text-xs text-muted">
                              {(b.batchType === "normal" || b.batchType === "exam") ? "Normal Class" : "Revision"} - Seats {b.enrolledCount || 0}/{b.seatCap || 0}
                            </div>
                            <div className="text-xs text-muted">
                              Students ({b.enrolledCount || 0}): {formatStudentNames(b.students)}
                            </div>
                          </div>
                          <Badge className={cn("capitalize", statusTone(b.status))}>
                            {b.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                  </Card>
                  ) : null}

                  {showPayments ? (
                  <Card className="p-4 rounded-xl bg-white shadow-sm border border-rose-100/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-text">{isAllView ? "All Payments" : "Recent Payments"}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Revenue {formatMoney(data.payments.revenue)}</Badge>
                        {!isAllView ? (
                          <Button variant="ghost" size="sm" onClick={() => openSection("payments")}>
                            See all
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  <div className="space-y-3">
                    {data.recent.payments.length === 0 ? (
                      <div className="text-sm text-muted">No payments yet.</div>
                    ) : (
                      data.recent.payments.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-text capitalize">
                              {p.type} - {formatMoney(p.amount)}
                            </div>
                            <div className="text-xs text-muted">{formatDateTime(p.createdAt)}</div>
                            <div className="text-xs text-muted">Paid by: {formatStudentLabel(p.student)}</div>
                            {p.reason ? <div className="text-xs text-muted">Reason: {p.reason}</div> : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("capitalize", statusTone(p.status))}>
                              {p.status}
                            </Badge>
                            {p.refundTotal ? (
                              <Badge variant="secondary">Refunded {formatMoney(p.refundTotal)}</Badge>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  </Card>
                  ) : null}
                </div>
              ) : null}

              {showNotes ? (
                <Card className="p-4 rounded-xl bg-white shadow-sm border border-amber-100/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Notebook className="w-4 h-4" />
                      {isAllView ? "All Notes" : "Notes"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Total {data.notes.total}</Badge>
                      {!isAllView ? (
                        <Button variant="ghost" size="sm" onClick={() => openSection("notes")}>
                          See all
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data.recent.notes.length === 0 ? (
                      <div className="text-sm text-muted">No notes yet.</div>
                    ) : (
                      data.recent.notes.map((n, idx) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-text">{n.title || "Note"}</div>
                            <div className="text-xs text-muted">
                              Subject: {n.subject || "-"} | Class: {n.classLevel || "-"} | Board: {n.board || "-"}
                            </div>
                            <div className="text-xs text-muted">{formatDateTime(n.createdAt)}</div>
                          </div>
                          <Badge variant="secondary">{formatMoney(n.price || 0)}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              ) : null}
            </>
          ) : (
            <Card className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="text-sm text-muted">No data available.</div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
