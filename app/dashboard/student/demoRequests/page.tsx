"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Eye, Video, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { markDemoJoin } from "@/services/bookingService";
import UpgradeToRegularModal from "@/components/UpgradeToRegularModal";
import {
  CLASS_JOIN_AVAILABLE_SOON_MESSAGE,
  CLASS_JOIN_AVAILABLE_SOON_LABEL,
  CLASS_JOIN_NOTICE,
  DEMO_CLASS_DURATION_MINUTES,
  getClassJoinWindowState,
} from "@/utils/classJoinNotice";

import {
  getStudentDemoRequests,
  updateStudentDemoRequestStatus,
} from "@/services/studentDemoService";
import { useNotificationRefresh } from "@/hooks/useNotificationRefresh";
import { formatTime12 } from "@/utils/timeFormat";

export default function StudentDemoRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeBooking, setUpgradeBooking] = useState<any | null>(null);

  // 🔥 Per-request action loading
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: "confirmed" | "rejected" | null;
  }>({});

  const getExpiryMessage = (booking: any) => {
    if (booking?.expiryReason === "tutor-no-response") {
      return "Expired because the tutor did not accept the request within 24 hours. Please Book Again.";
    }
    if (booking?.expiryReason === "student-no-response") {
      return "Expired because the student did not accept the request within 24 hours. Please Book Again.";
    }
    if (booking?.status === "expired") {
      return "This demo is no longer active.";
    }
    return null;
  };

  const getDecisionReason = (booking: any) => {
    const note = String(booking?.note || '').trim();
    if (!note) return null;
    if (booking?.status === 'rejected' || booking?.status === 'cancelled') return note;
    return null;
  };

  // Load Requests
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStudentDemoRequests();

      if (res.success) {
        setRequests(res.data || []);
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

  const getDemoStart = (req: any) => {
    const base = new Date(req.preferredDate);
    if (Number.isNaN(base.getTime())) return null;
    const [hourStr, minuteStr] = String(req.preferredTime || "00:00").split(":");
    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      Number(hourStr) || 0,
      Number(minuteStr) || 0,
      0
    );
  };

  // Accept / Reject
  const handleStatus = async (
    id: string,
    status: "confirmed" | "rejected"
  ) => {
    const reason =
      status === "rejected"
        ? window.prompt("Reason for rejecting this demo request?", "")
        : null;
    if (status === "rejected") {
      if (reason === null) return;
      if (!reason.trim()) {
        toast({ title: "Reason required", description: "Please enter a reason before rejecting." });
        return;
      }
    }

    try {
      setActionLoading((prev) => ({ ...prev, [id]: status }));

      const res = await updateStudentDemoRequestStatus(id, status, reason?.trim());

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

      <div className="lg:pr-64">
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
                    {req.tutorProfileId ? (
                      <Link
                        href={`/dashboard/student/search/tutor/${req.tutorProfileId}?userId=${req.tutorUserId || req.tutorId}`}
                        className="font-semibold text-gray-900 hover:text-primary hover:underline"
                      >
                        {req.tutorName || "Tutor"}
                      </Link>
                    ) : (
                      <div className="font-semibold">{req.tutorName || "Tutor"}</div>
                    )}

                    <div className="text-sm text-gray-500">{req.subject}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                      {req.tutorQualification && <span>{req.tutorQualification}</span>}
                      {req.tutorExperience !== null && req.tutorExperience !== undefined && (
                        <span>{req.tutorExperience} yrs exp</span>
                      )}
                      {req.tutorTeachingMode && <span>{req.tutorTeachingMode}</span>}
                      {(req.tutorCity || req.tutorState) && (
                        <span>{[req.tutorCity, req.tutorState].filter(Boolean).join(", ")}</span>
                      )}
                    </div>
                    {Array.isArray(req.tutorSubjects) && req.tutorSubjects.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Teaches: {req.tutorSubjects.slice(0, 4).join(", ")}
                      </div>
                    )}

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
                        {formatTime12(req.preferredTime) || "Scheduled"}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  {req.status === "confirmed" ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Booked
                    </Badge>
                  ) : req.status === "expired" ? (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      Expired
                    </Badge>
                  ) : req.status === "cancelled" ? (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      Cancelled
                    </Badge>
                  ) : req.status === "rejected" ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Rejected
                    </Badge>
                  ) : req.status === "completed" ? (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Completed
                    </Badge>
                  ) 
                  : req.status === "tutor-missed" ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Tutor Missed
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  )}
                </div>

                {getExpiryMessage(req) && (
                  <p className="mt-3 text-sm text-gray-500">
                    {getExpiryMessage(req)}
                  </p>
                )}
                {getDecisionReason(req) && (
                  <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <span className="font-semibold">Reason:</span>{' '}
                    {getDecisionReason(req)}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {req.tutorProfileId && (
                    <Link href={`/dashboard/student/search/tutor/${req.tutorProfileId}?userId=${req.tutorUserId || req.tutorId}`}>
                      <Button
                        variant="outline"
                        className="rounded-full px-4 py-2"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </Link>
                  )}
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
                          handleStatus(req._id, "rejected")
                        }
                        disabled={
                          actionLoading[req._id] === "rejected"
                        }
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 disabled:opacity-70"
                      >
                        {actionLoading[req._id] === "rejected" ? (
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
                  {req.status === "confirmed" && req.meetingLink && (() => {
                    const joinState = getClassJoinWindowState(getDemoStart(req), {
                      durationMin: DEMO_CLASS_DURATION_MINUTES,
                    });
                    return (
                      <div className="space-y-1">
                        <button
                          disabled={!joinState.canJoin}
                          onClick={async () => {
                            if (!joinState.canJoin) return;
                            if (!window.confirm(CLASS_JOIN_NOTICE)) return;
                            let meetingLink = req.meetingLink;
                            try {
                              const joinRes = await markDemoJoin(req._id);
                              meetingLink = joinRes?.meetingLink || meetingLink;
                            } catch {}
                            window.open(
                              meetingLink,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                          className={`flex items-center gap-2 font-medium text-sm px-4 py-2 rounded-full transition ${
                            joinState.canJoin
                              ? "bg-[#FFD54F] hover:bg-[#f3c942] text-black"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <Video className="w-4 h-4" />
                          {joinState.canJoin ? "Join Demo" : CLASS_JOIN_AVAILABLE_SOON_LABEL}
                        </button>
                        {!joinState.canJoin && (
                          <p className="text-xs text-gray-500">{CLASS_JOIN_AVAILABLE_SOON_MESSAGE}</p>
                        )}
                      </div>
                    );
                  })()}

                  {req.status === "completed" && !req.regularClassId && (
                    <button
                      onClick={() => setUpgradeBooking(req)}
                      className="flex items-center gap-2 bg-[#FFD54F] hover:bg-[#f3c942] text-black font-semibold text-sm px-4 py-2 rounded-full transition"
                    >
                      Start Regular Class
                    </button>
                  )}

                  {req.status === "completed" && req.regularClassId && (
                    <button
                      onClick={() => setUpgradeBooking(req)}
                      className="flex items-center gap-2 bg-[#FFD54F] hover:bg-[#f3c942] text-black font-semibold text-sm px-4 py-2 rounded-full transition"
                    >
                      Complete Payment
                    </button>
                  )}
                </div>
              </Card>
            ))}
        </main>
      </div>

      {upgradeBooking && (
        <UpgradeToRegularModal
          booking={upgradeBooking}
          onClose={() => setUpgradeBooking(null)}
        />
      )}
    </div>
  );
}




