"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Video, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { markDemoJoin } from "@/services/bookingService";

import {
  getStudentDemoRequests,
  updateStudentDemoRequestStatus,
} from "@/services/studentDemoService";
import { useNotificationRefresh } from "@/hooks/useNotificationRefresh";

export default function StudentDemoRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Per-request action loading
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: "confirmed" | "cancelled" | null;
  }>({});

  // Load Requests
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStudentDemoRequests();

      if (res.success) {
        const filtered = (res.data || []).filter(
          (x: any) => x.status !== "cancelled"
        );
        setRequests(filtered);
      } else {
        toast({
          title: "Error",
          description: res.message || "Failed to load demo requests",
        });
      }
    } catch (err: any) {
      toast({
        title: "Server Error",
        description: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const isDemoNotification = (detail: any) => {
    const title = String(
      detail?.data?.title || detail?.data?.message || ""
    ).toLowerCase();
    const meta = detail?.data?.meta || {};
    return title.includes("demo") || Boolean(meta.bookingId);
  };

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useNotificationRefresh(() => {
    loadRequests();
  }, isDemoNotification);

  // Accept / Reject
  const handleStatus = async (
    id: string,
    status: "confirmed" | "cancelled"
  ) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: status }));

      const res = await updateStudentDemoRequestStatus(id, status);

      if (res.success) {
        toast({ title: "Success", description: res.message });
        loadRequests();
      } else {
        toast({
          title: "Error",
          description: res.message || "Failed to update status",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="student"
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole="student"
      />

      <div className="lg:pl-64">
        <Topbar
          title="Demo Requests"
          subtitle="Accept or reject demo requests from tutors"
        />

        <main className="p-4 lg:p-6 space-y-4">
          {/* Loading */}
          {loading && (
            <div className="text-center text-muted py-10 animate-pulse">
              Loading requests...
            </div>
          )}

          {/* Empty */}
          {!loading && requests.length === 0 && (
            <Card className="p-6 text-center text-muted rounded-2xl bg-white shadow-sm">
              No demo requests found.
            </Card>
          )}

          {/* Requests */}
          {!loading &&
            requests.map((req) => (
              <Card
                key={req._id}
                className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">
                      {req.tutorName || "Tutor"}
                    </div>

                    <div className="text-sm text-gray-500">{req.subject}</div>
                    <div className="text-sm text-gray-500">
                      Mode: {req.studentLearningMode || "N/A"}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(req.preferredDate).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {req.preferredTime || "Scheduled"}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  {req.status === "confirmed" ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
                    </Badge>
                  ) : req.status === "expired" ? (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      Expired
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {req.status === "pending" && req.requestedBy === "tutor" && (
                    <>
                      {/* Accept */}
                      <Button
                        onClick={() =>
                          handleStatus(req._id, "confirmed")
                        }
                        disabled={
                          actionLoading[req._id] === "confirmed"
                        }
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4 py-2 disabled:opacity-70"
                      >
                        {actionLoading[req._id] === "confirmed" ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Accepting...
                          </span>
                        ) : (
                          "Accept"
                        )}
                      </Button>

                      {/* Reject */}
                      <Button
                        onClick={() =>
                          handleStatus(req._id, "cancelled")
                        }
                        disabled={
                          actionLoading[req._id] === "cancelled"
                        }
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 disabled:opacity-70"
                      >
                        {actionLoading[req._id] === "cancelled" ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Rejecting...
                          </span>
                        ) : (
                          "Reject"
                        )}
                      </Button>
                    </>
                  )}

                  {req.status === "pending" &&
                    req.requestedBy === "student" && (
                      <span className="text-xs text-gray-500 italic">
                        Pending Tutor Approval
                      </span>
                    )}

                  {req.status === "confirmed" && req.meetingLink && (
                    <button
                      onClick={async () => {
                        try {
                          await markDemoJoin(req._id);
                        } catch {}
                        window.open(
                          req.meetingLink,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                      className="flex items-center gap-2 bg-[#FFD54F] hover:bg-[#f3c942] text-black font-medium text-sm px-4 py-2 rounded-full transition"
                    >
                      <Video className="w-4 h-4" />
                      Join Demo
                    </button>
                  )}
                </div>
              </Card>
            ))}
        </main>
      </div>
    </div>
  );
}
