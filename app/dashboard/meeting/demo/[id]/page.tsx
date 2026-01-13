"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBookingById, recordDemoEnd, recordDemoJoin } from "@/services/bookingService";
import { useAppSelector } from "@/store/store";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

export default function DemoMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id ? String(params.id) : "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [error, setError] = useState<string>("");
  const authUser = useAppSelector((state) => state.auth.user);
  const role = authUser?.role || "student";
  const displayName =
    authUser?.phone
      ? `${role === "tutor" ? "Tutor" : "Student"} ${authUser.phone}`
      : role === "tutor"
      ? "Tutor"
      : "Student";
  const exitPath =
    role === "tutor"
      ? "/dashboard/tutor/demo_sessions"
      : role === "student"
      ? "/dashboard/student/demoBookings"
      : "/dashboard";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const joinedRef = useRef(false);
  const endedRef = useRef(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      try {
        setLoading(true);
        const booking = await getBookingById(bookingId);
        if (!booking?.meetingLink) {
          setError("Meeting link not available yet.");
          return;
        }
        if (booking.type !== "demo") {
          setError("This meeting page is only for demo classes.");
          return;
        }
        setMeetingLink(booking.meetingLink);
      } catch (err: any) {
        setError(err.message || "Unable to load meeting");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!meetingLink || !containerRef.current) return;

    const loadScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const existing = document.getElementById("jitsi-external-api");
        if (existing) {
          existing.addEventListener("load", () => resolve());
          return;
        }
        const script = document.createElement("script");
        script.id = "jitsi-external-api";
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Jitsi API"));
        document.body.appendChild(script);
      });

    const setupMeeting = async () => {
      try {
        await loadScript();
        if (!containerRef.current) return;

        const url = new URL(meetingLink);
        const roomName = url.pathname.replace("/", "");
        const domain = url.hostname;
        if (!roomName) {
          setError("Invalid meeting link.");
          return;
        }

        apiRef.current = new window.JitsiMeetExternalAPI(domain, {
          roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName,
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
        });

        apiRef.current.addEventListener("videoConferenceJoined", async () => {
          if (joinedRef.current) return;
          joinedRef.current = true;
          try {
            await recordDemoJoin(bookingId);
          } catch {}
        });

        const handleEnd = async () => {
          if (endedRef.current) return;
          endedRef.current = true;
          try {
            await recordDemoEnd(bookingId);
          } catch {}
          router.replace(exitPath);
        };

        apiRef.current.addEventListener("videoConferenceLeft", handleEnd);
        apiRef.current.addEventListener("readyToClose", handleEnd);
      } catch (err: any) {
        setError(err.message || "Failed to load meeting");
      }
    };

    setupMeeting();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose?.();
        apiRef.current = null;
      }
    };
  }, [meetingLink, bookingId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole={role} />
      <Sidebar userRole={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          title="Demo Meeting"
          subtitle="Jitsi live class"
          greeting={false}
          actionPosition="left"
          action={
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.replace(exitPath)}
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          }
        />

        <main className="p-4 lg:p-6">
          {loading ? (
            <Card className="p-6 rounded-2xl bg-white shadow-sm">
              Loading meeting...
            </Card>
          ) : error ? (
            <Card className="p-6 rounded-2xl bg-white shadow-sm text-red-600">
              {error}
            </Card>
          ) : (
            <div className="h-[75vh] w-full rounded-2xl overflow-hidden border bg-black">
              <div ref={containerRef} className="h-full w-full" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
