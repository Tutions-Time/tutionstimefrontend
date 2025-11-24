"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Video, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import {
  getStudentDemoRequests,
  updateStudentDemoRequestStatus,
} from "@/services/studentDemoService";

export default function StudentDemoRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getStudentDemoRequests();

      if (res.success) {
        const filtered = (res.data || [])
          .filter((x: any) => x.status !== "cancelled")
          .filter((x: any) => x.requestedBy === "tutor");
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
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Change Status
  const handleStatus = async (
    id: string,
    status: "confirmed" | "cancelled"
  ) => {
    try {
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
        {/* Topbar */}
        <Topbar
          title="Demo Requests"
          subtitle="Accept or reject demo requests from tutors"
        />

        {/* Main */}
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

          {/* Requests List */}
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

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {/* Date */}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(req.preferredDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>

                      {/* Time */}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {req.preferredTime || "Scheduled"}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {req.status === "confirmed" ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
                    </Badge>
                  ) : req.status === "cancelled" ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Cancelled
                    </Badge>
                  ) : req.status === "completed" ? (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {/* Accept / Reject — only for tutor-initiated requests */}
                  {req.status === "pending" && req.requestedBy === "tutor" && (
                    <>
                      <Button
                        onClick={() => handleStatus(req._id, "confirmed")}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4 py-2"
                      >
                        Accept
                      </Button>

                      <Button
                        onClick={() => handleStatus(req._id, "cancelled")}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* Sender view: student-initiated requests show pending tutor approval */}
                  {req.status === "pending" && req.requestedBy === "student" && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Pending Tutor Approval
                    </Badge>
                  )}

                  {/* Join Demo */}
                  {req.status === "confirmed" && req.meetingLink && (
                    <a
                      href={req.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#FFD54F] hover:bg-[#f3c942] text-black font-medium text-sm px-4 py-2 rounded-full transition"
                    >
                      <Video className="w-4 h-4" />
                      Join Demo
                    </a>
                  )}
                </div>
              </Card>
            ))}
        </main>
      </div>
    </div>
  );
}
