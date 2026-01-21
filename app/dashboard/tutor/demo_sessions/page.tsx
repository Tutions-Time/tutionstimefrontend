'use client';

import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Video, CheckCircle } from 'lucide-react';
import {
  getTutorDemoRequests,
  markTutorDemoJoin,
  updateDemoRequestStatus,
} from '@/services/tutorService';
import { toast } from '@/hooks/use-toast';
import { useNotificationRefresh } from '@/hooks/useNotificationRefresh';

export default function TutorDemoRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Per-booking action loading state
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: 'confirmed' | 'cancelled' | null;
  }>({});

  // Load demo requests
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTutorDemoRequests();
      if (res.success) {
        const filtered = (res.data || []).filter(
          (b: any) => b.status !== 'cancelled'
        );
        setBookings(filtered);
      } else {
        toast({
          title: 'Error',
          description: res.message || 'Failed to load demo requests',
        });
      }
    } catch (err: any) {
      toast({ title: 'Server Error', description: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const isDemoNotification = (detail: any) => {
    const title = String(
      detail?.data?.title || detail?.data?.message || ''
    ).toLowerCase();
    const meta = detail?.data?.meta || {};
    return title.includes('demo') || Boolean(meta.bookingId);
  };

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useNotificationRefresh(() => {
    loadBookings();
  }, isDemoNotification);

  useEffect(() => {
    const handleFocus = () => {
      loadBookings();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadBookings]);

  // Accept / Reject
  const handleStatus = async (
    id: string,
    status: 'confirmed' | 'cancelled'
  ) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: status }));

      const res = await updateDemoRequestStatus(id, status);
      if (res.success) {
        toast({ title: 'Success', description: res.message });
        loadBookings();
      } else {
        toast({ title: 'Error', description: res.message });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar + Sidebar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="tutor"
      />
      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="Demo Requests"
          subtitle="Review and manage your demo class requests"
        />

        <main className="p-4 lg:p-6 space-y-4">
          {/* Loading */}
          {loading && (
            <div className="text-center text-muted py-10 animate-pulse">
              Loading demo requests...
            </div>
          )}

          {/* Empty */}
          {!loading && bookings.length === 0 && (
            <Card className="p-6 text-center text-muted rounded-2xl bg-white shadow-sm">
              No demo requests found.
            </Card>
          )}

          {/* Demo Cards */}
          {!loading &&
            bookings.map((b) => (
              <Card
                key={b._id}
                className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">
                      {b.studentName || 'Unknown Student'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(b.subjects?.length
                        ? b.subjects.join(', ')
                        : b.subject) || 'Subject'}
                    </div>

                    {(b.studentBoard || b.studentLearningMode) && (
                      <div className="mt-1 text-xs text-gray-500">
                        {b.studentBoard && (
                          <span>Board: {b.studentBoard}</span>
                        )}
                        {b.studentBoard && b.studentLearningMode && (
                          <span className="mx-2">|</span>
                        )}
                        {b.studentLearningMode && (
                          <span>Mode: {b.studentLearningMode}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(b.preferredDate).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Demo Session
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  {b.status === 'confirmed' ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
                    </Badge>
                  ) : b.status === 'expired' ? (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      Expired
                    </Badge>
                  ) : b.status ==='completed' ? (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Completed
                    </Badge>
                  ) : 
                  (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Pendingg
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {b.status === 'pending' &&
                    b.requestedBy === 'student' && (
                      <>
                        {/* Accept */}
                        <Button
                          onClick={() =>
                            handleStatus(b._id, 'confirmed')
                          }
                          disabled={
                            actionLoading[b._id] === 'confirmed'
                          }
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4 py-2 disabled:opacity-70"
                        >
                          {actionLoading[b._id] === 'confirmed' ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Accepting...
                            </span>
                          ) : (
                            'Accept'
                          )}
                        </Button>

                        {/* Reject */}
                        <Button
                          onClick={() =>
                            handleStatus(b._id, 'cancelled')
                          }
                          disabled={
                            actionLoading[b._id] === 'cancelled'
                          }
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 disabled:opacity-70"
                        >
                          {actionLoading[b._id] === 'cancelled' ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Rejecting...
                            </span>
                          ) : (
                            'Reject'
                          )}
                        </Button>
                      </>
                    )}

                  {b.status === 'confirmed' && b.meetingLink && (
                    <button
                      onClick={async () => {
                        try {
                          await markTutorDemoJoin(b._id);
                        } catch {}
                        window.open(
                          b.meetingLink,
                          '_blank',
                          'noopener,noreferrer'
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
