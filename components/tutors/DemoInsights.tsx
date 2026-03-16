'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getTutorDemoInsights } from '@/services/tutorService';
import {
  BarChart2,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Star,
  TrendingUp,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface Insights {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  expired: number;
  studentMissed: number;
  tutorMissed: number;
  feedbackGiven: number;
  rejectedByStudent: number;
  likedByStudent: number;
  convertedToRegular: number;
  rejectionRate: number;
  conversionRate: number;
  avgRating: number | null;
}

export default function DemoInsights() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTutorDemoInsights()
      .then((res) => {
        if (res.success) setInsights(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm h-28 flex items-center justify-center text-gray-400 text-sm">
        Loading demo insights...
      </div>
    );
  }

  if (!insights) return null;

  const tiles = [
    {
      label: 'Total Demos',
      value: insights.total,
      icon: <BarChart2 className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Completed',
      value: insights.completed,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Students Rejected',
      value: insights.rejectedByStudent,
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Students Liked',
      value: insights.likedByStudent,
      icon: <ThumbsUp className="w-5 h-5" />,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Converted to Regular',
      value: insights.convertedToRegular,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Rejection Rate',
      value: `${insights.rejectionRate}%`,
      icon: <RefreshCw className="w-5 h-5" />,
      color:
        insights.rejectionRate >= 50
          ? 'bg-red-50 text-red-600'
          : insights.rejectionRate >= 25
          ? 'bg-orange-50 text-orange-600'
          : 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Conversion Rate',
      value: `${insights.conversionRate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Avg Rating',
      value: insights.avgRating != null ? `${insights.avgRating}/5` : '—',
      icon: <Star className="w-5 h-5" />,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Pending',
      value: insights.pending,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-gray-50 text-gray-600',
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-blue-500" />
        Demo Performance Insights
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {tiles.map((t) => (
          <Card
            key={t.label}
            className="p-4 rounded-2xl bg-white shadow-sm flex flex-col gap-2"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.color}`}>
              {t.icon}
            </div>
            <div className="text-2xl font-bold text-gray-800">{t.value}</div>
            <div className="text-xs text-gray-500 leading-tight">{t.label}</div>
          </Card>
        ))}
      </div>

      {insights.rejectedByStudent > 0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>{insights.rejectedByStudent}</strong>{' '}
            {insights.rejectedByStudent === 1 ? 'student has' : 'students have'} not proceeded after a demo.
            Consider requesting feedback to improve your sessions.
          </span>
        </div>
      )}
    </div>
  );
}
