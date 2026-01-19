"use client";

import { useEffect, useState } from "react";
import BookingCard from "@/components/student/bookings/BookingCard";
import { getStudentBookings } from "@/services/bookingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UpcomingSessions() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudentBookings();

        // ✅ FIXED FILTERING LOGIC
        const upcoming = data.filter((b: any) => {
          // remove cancelled
          if (b.status === "cancelled") return false;

        // Hide completed demos after payment so dashboard only shows upcoming sessions
        if (b.type === "demo" && b.status === "completed") return false;

        // include everything else
        return true;
        });

        setSessions(upcoming.slice(0, 3)); // Show only first 3 entries
      } catch (err) {
        console.error("Error loading sessions:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">Upcoming Sessions</h2>
        <Link href="/dashboard/student/demoBookings">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-500 text-sm animate-pulse">
          Loading upcoming sessions...
        </p>
      )}

      {/* EMPTY */}
      {!loading && sessions.length === 0 && (
        <Card className="p-6 text-center text-gray-500 rounded-2xl shadow-soft bg-white">
          No upcoming sessions.
        </Card>
      )}

      {/* SESSIONS LIST */}
      {!loading &&
        sessions.map((session) => (
          <div key={session._id}>
            {/* compact mode still supports UpgradeToRegularModal */}
            <BookingCard booking={session} compact />
          </div>
        ))}
    </div>
  );
}
