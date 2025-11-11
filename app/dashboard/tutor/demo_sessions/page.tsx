'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Video, CheckCircle } from 'lucide-react';
import { getTutorDemoRequests, updateDemoRequestStatus } from '@/services/tutorService';
import { toast } from '@/hooks/use-toast';

export default function TutorDemoRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load demo requests
  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getTutorDemoRequests();
      if (res.success) setBookings(res.data || []);
      else toast({ title: 'Error', description: res.message || 'Failed to load demo requests' });
    } catch (err: any) {
      toast({ title: 'Server Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Accept / Reject actions
  const handleStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      const res = await updateDemoRequestStatus(id, status);
      if (res.success) {
        toast({ title: 'Success', description: res.message });
        loadBookings();
      } else {
        toast({ title: 'Error', description: res.message });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar + Sidebar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        {/* Topbar */}
        <Topbar title="Demo Requests" subtitle="Review and manage your demo class requests" />

        {/* Main Content */}
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

          {/* Demo Request List */}
          {!loading &&
            bookings.map((b) => (
              <Card
                key={b._id}
                className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">
                      {b.studentId?.name || 'Unknown Student'}
                    </div>
                    <div className="text-sm text-gray-500">{b.subject}</div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(b.preferredDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Demo Session
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {b.status === 'confirmed' ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
                    </Badge>
                  ) : b.status === 'cancelled' ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>
                  ) : b.status === 'completed' ? (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">Completed</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {b.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatus(b._id, 'confirmed')}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4 py-2"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatus(b._id, 'cancelled')}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {b.status === 'confirmed' && b.meetingLink && (
                    <a
                      href={b.meetingLink}
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
