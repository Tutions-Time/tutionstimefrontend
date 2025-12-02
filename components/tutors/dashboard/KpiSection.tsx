"use client";

import { useEffect, useState } from "react";
import { Calendar, ClipboardList, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getTutorProgressSummary } from "@/services/progressService";

export default function KpiSection() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const s = await getTutorProgressSummary();
        setSummary(s?.data || null);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  const sessions = summary?.totals?.sessions ?? 0;
  const completed = summary?.totals?.completed ?? 0;
  const attendanceConsistency = summary?.totals?.attendanceConsistency ?? 0;
  const averageRating = summary?.totals?.averageRating ?? 0;
  const ratingCount = summary?.totals?.ratingCount ?? 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-text">{loading ? "-" : sessions}</p>
            <p className="text-xs sm:text-sm text-muted">Sessions (7d)</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-text">{loading ? "-" : completed}</p>
            <p className="text-xs sm:text-sm text-muted">Completed (7d)</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-text">{loading ? "-" : `${attendanceConsistency}%`}</p>
            <p className="text-xs sm:text-sm text-muted">Attendance Consistency</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-text">{loading ? "-" : `${averageRating.toFixed(1)} ⭐`}</p>
            <p className="text-xs sm:text-sm text-muted">Ratings ({ratingCount})</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
