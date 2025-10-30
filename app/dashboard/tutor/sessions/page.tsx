'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, BookOpen, CheckCircle } from 'lucide-react';
import { getTutorBookings } from '@/services/studentService';
import { toast } from '@/hooks/use-toast';
import dayjs from 'dayjs';

export default function TutorSessions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getTutorBookings();
      setBookings(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load classes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar title="My Classes" subtitle="Upcoming and past sessions" />

        <main className="p-4 lg:p-6 space-y-4">
          {loading && (
            <div className="text-center text-muted py-10 animate-pulse">
              Loading your classes...
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <Card className="p-6 text-center text-muted rounded-2xl bg-white shadow-sm">
              No sessions found.
            </Card>
          )}

          {!loading &&
            bookings.map((b) => (
              <Card
                key={b._id}
                className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">
                      {b.studentId?.name || 'Student'}
                    </div>
                    <div className="text-sm text-muted">
                      {b.subject} • {b.type === 'demo' ? 'Demo' : 'Regular'}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {dayjs(b.date).format('MMM D, YYYY')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {dayjs(b.startTime).format('h:mm A')}
                      </span>
                    </div>
                  </div>

                  {b.status === 'confirmed' ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Upcoming
                    </Badge>
                  ) : b.status === 'completed' ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle className="w-3 h-3 mr-1" /> Completed
                    </Badge>
                  ) : b.status === 'pending' ? (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Cancelled
                    </Badge>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Materials
                  </Button>

                  {/* ✅ Show Start Class for confirmed or pending demo sessions */}
                  {(['confirmed', 'pending'].includes(b.status)) && (
                    <Button className="bg-primary hover:bg-primary/90 text-text">
                      <Video className="w-4 h-4 mr-2" />
                      Start Class
                    </Button>
                  )}
                </div>
              </Card>
            ))}
        </main>
      </div>
    </div>
  );
}
