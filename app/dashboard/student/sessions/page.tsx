"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video } from "lucide-react";
import { getMyBookings } from "@/services/studentService";
import dayjs from "dayjs";

export default function StudentSessions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyBookings();
        setSessions(data);
      } catch (err) {
        console.error("Fetch sessions failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar title="My Sessions" subtitle="Upcoming and past classes" />

        <main className="p-4 lg:p-6 space-y-4">
          {loading && <p className="text-center text-gray-500 py-6">Loading sessions...</p>}

          {!loading && sessions.length === 0 && (
            <Card className="p-6 text-center text-gray-500">No sessions found yet.</Card>
          )}

          {sessions.map((s) => (
            <Card key={s._id} className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{s.tutorId?.name}</div>
                  <div className="text-sm text-muted">{s.subject}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {dayjs(s.startTime).format("MMM D, YYYY")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {dayjs(s.startTime).format("h:mm A")}
                    </span>
                  </div>
                </div>

                {s.status === "confirmed" ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20">Upcoming</Badge>
                ) : s.status === "completed" ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
                ) : (
                  <Badge className="bg-gray-200 text-gray-700">Pending</Badge>
                )}
              </div>

              {s.status === "confirmed" && s.zoomLink && (
                <div className="mt-4">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => window.open(s.zoomLink, "_blank")}
                  >
                    <Video className="w-4 h-4 mr-2" /> Join Class
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}
