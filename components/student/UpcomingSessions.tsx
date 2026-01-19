"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStudentRegularClasses } from "@/services/studentService";
import { joinSession } from "@/services/tutorService";

export default function UpcomingSessions() {
  const [loading, setLoading] = useState(true);
  const [firstSession, setFirstSession] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const classes = await getStudentRegularClasses();
        const futureClasses = classes
          .filter((rc: any) => rc.nextSession && rc.nextSession.status === "scheduled")
          .sort(
            (a: any, b: any) =>
              new Date(a.nextSession.startDateTime).getTime() -
              new Date(b.nextSession.startDateTime).getTime()
          );
        setFirstSession(futureClasses.length ? futureClasses[0] : null);
      } catch (err) {
        console.error("Failed to load upcoming sessions", err);
        setFirstSession(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleJoin = async (sessionId: string) => {
    const res = await joinSession(sessionId);
    if (res?.success && res?.url) {
      window.open(res.url, "_blank");
      return;
    }
    toast.error(res?.message || "Unable to join session");
  };

  const displaySession = firstSession?.nextSession
    ? {
        session: firstSession.nextSession,
        regularClass: firstSession,
      }
    : null;

  const joinState = {
    canJoin: Boolean(displaySession?.session?.canJoin),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">Upcoming Sessions</h2>
        <Link href="/dashboard/student/demoBookings?tab=regular">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {loading && (
        <p className="text-gray-500 text-sm animate-pulse">
          Loading upcoming sessions...
        </p>
      )}

      {!loading && !displaySession && (
        <Card className="p-6 text-center text-gray-500 rounded-2xl shadow-soft bg-white">
          No upcoming sessions.
        </Card>
      )}

      {displaySession && (
        <Card className="p-4 rounded-2xl shadow-soft bg-white">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted">{displaySession.regularClass?.subject || "Regular Class"}</p>
              <p className="text-lg font-semibold">
                {new Date(displaySession.session.startDateTime).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(displaySession.session.startDateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
              <span className="text-xs uppercase tracking-wide px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                {displaySession.regularClass?.planType === "monthly" ? "Monthly" : "Regular"}
              </span>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button
              onClick={() => handleJoin(displaySession.session._id)}
              disabled={!joinState.canJoin}
              className={`px-4 py-2 rounded-full text-sm ${joinState.canJoin ? "bg-primary text-white" : "bg-gray-200 text-gray-600"}`}
            >
              {joinState.canJoin ? "Join Now" : "Join (available soon)"}
            </Button>
            <Link href={`/dashboard/student/demoBookings?tab=regular`}>
              <Button variant="outline" size="sm">
                View Sessions
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
