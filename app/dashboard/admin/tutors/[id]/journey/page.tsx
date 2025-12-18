"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Notebook, PlayCircle, Users, Wallet } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getTutorJourney } from "@/services/adminService";

type JourneyData = {
  tutor: {
    id: string;
    profileId?: string;
    name: string;
    email: string;
    phone: string;
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
    demos: any[];
    sessions: any[];
    batches: any[];
    payments: any[];
  };
};

export default function TutorJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = useMemo(() => (params?.id ? String(params.id) : ""), [params]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JourneyData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tutorId) return;
      try {
        setLoading(true);
        const res = await getTutorJourney(tutorId);
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
  }, [tutorId]);

  const formatDate = (v?: string) => {
    if (!v) return "-";
    return new Date(v).toLocaleDateString();
  };

  const formatDateTime = (v?: string) => {
    if (!v) return "-";
    return new Date(v).toLocaleString();
  };

  const formatMoney = (n?: number) => `₹${(Number(n || 0)).toLocaleString("en-IN")}`;

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
          title="Tutor Journey"
          subtitle="Full lifecycle: demos, sessions, batches, notes, payments"
          greeting={false}
          action={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
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
              <Card className="p-6 rounded-2xl bg-white shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
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
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      Status: {data.tutor.status}
                    </Badge>
                    <Badge variant="outline">Joined: {formatDate(data.tutor.joinedAt)}</Badge>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="p-4 rounded-xl bg-white shadow-sm">
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

                <Card className="p-4 rounded-xl bg-white shadow-sm">
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

                <Card className="p-4 rounded-xl bg-white shadow-sm">
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

                <Card className="p-4 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted mb-2">
                    <Wallet className="w-4 h-4" />
                    Payments
                  </div>
                  <div className="text-2xl font-semibold text-text">{formatMoney(data.payments.revenue)}</div>
                  <div className="text-sm text-muted mt-1">
                    Payouts {formatMoney(data.payments.payouts)} · Refunds {formatMoney(data.payments.refunds)}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="p-4 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">Recent Demos</div>
                    <Badge variant="outline">Total {data.demos.total}</Badge>
                  </div>
                  <div className="space-y-3">
                    {data.recent.demos.length === 0 ? (
                      <div className="text-sm text-muted">No demos yet.</div>
                    ) : (
                      data.recent.demos.map((d: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-text">{d.subject || "Demo"}</div>
                            <div className="text-xs text-muted">
                              Preferred: {formatDate(d.preferredDate)} {d.preferredTime || ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="capitalize" variant="outline">
                              {d.status}
                            </Badge>
                            {d.regularClassId ? <Badge variant="secondary">Converted</Badge> : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-4 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">Recent Sessions</div>
                    <Badge variant="outline">Total {data.sessions.total}</Badge>
                  </div>
                  <div className="space-y-3">
                    {data.recent.sessions.length === 0 ? (
                      <div className="text-sm text-muted">No sessions yet.</div>
                    ) : (
                      data.recent.sessions.map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-text">{formatDateTime(s.startDateTime)}</div>
                            <div className="text-xs text-muted">
                              {s.groupBatchId ? "Group" : "1:1"} · {s.regularClassId ? "Regular" : "Demo/Adhoc"}
                            </div>
                          </div>
                          <Badge className="capitalize" variant="outline">
                            {s.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="p-4 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">Recent Batches</div>
                    <Badge variant="outline">Total {data.batches.total}</Badge>
                  </div>
                  <div className="space-y-3">
                    {data.recent.batches.length === 0 ? (
                      <div className="text-sm text-muted">No batches yet.</div>
                    ) : (
                      data.recent.batches.map((b: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-text">{b.subject || "Batch"}</div>
                            <div className="text-xs text-muted">
                              {b.batchType} · Seats {b.enrolled?.length || 0}/{b.seatCap || 0}
                            </div>
                          </div>
                          <Badge className="capitalize" variant="outline">
                            {b.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-4 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">Recent Payments</div>
                    <Badge variant="outline">Revenue {formatMoney(data.payments.revenue)}</Badge>
                  </div>
                  <div className="space-y-3">
                    {data.recent.payments.length === 0 ? (
                      <div className="text-sm text-muted">No payments yet.</div>
                    ) : (
                      data.recent.payments.map((p: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-text capitalize">
                              {p.type} · {formatMoney(p.amount)}
                            </div>
                            <div className="text-xs text-muted">{formatDateTime(p.createdAt)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="capitalize" variant="outline">
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
              </div>

              <Card className="p-4 rounded-xl bg-white shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted mb-2">
                  <Notebook className="w-4 h-4" />
                  Notes
                </div>
                <div className="text-2xl font-semibold text-text">{data.notes.total}</div>
                <div className="text-sm text-muted">Total notes published by this tutor</div>
              </Card>
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
