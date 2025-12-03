"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { getTutorProgressSummary } from "@/services/progressService";

export default function RatingsFeedbackWidget() {
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

  const avg = summary?.totals?.averageRating ?? 0;
  const ratingCount = summary?.totals?.ratingCount ?? 0;
  const r = summary?.rubricAverages || { teaching: 0, communication: 0, understanding: 0 };
  const comments: string[] = summary?.recentComments || [];

  const Stars = ({ value }: { value: number }) => (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${value >= n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  return (
    <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">Ratings & Feedback</div>
          <div className="mt-2 flex items-center gap-2">
            {loading ? (
              <div className="text-muted">-</div>
            ) : (
              <>
                <Stars value={Math.round(avg)} />
                <div className="text-sm text-gray-700">{avg.toFixed(1)} ({ratingCount})</div>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-muted">Teaching</div>
            <div className="font-semibold">{loading ? "-" : r.teaching?.toFixed?.(1) ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted">Communication</div>
            <div className="font-semibold">{loading ? "-" : r.communication?.toFixed?.(1) ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted">Understanding</div>
            <div className="font-semibold">{loading ? "-" : r.understanding?.toFixed?.(1) ?? "-"}</div>
          </div>
        </div>
      </div>

      {comments?.length ? (
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2">Recent Comments</div>
          <ul className="space-y-2">
            {comments.slice(0,5).map((c, i) => (
              <li key={i} className="text-sm text-gray-700">{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
