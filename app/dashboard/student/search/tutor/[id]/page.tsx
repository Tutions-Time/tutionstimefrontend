"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  getTutorById,
  getTutorAvailability,
  createBooking,
} from "@/services/studentService";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Star } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
}

interface Tutor {
  _id: string;
  userId: string;
  name: string;
  qualification?: string;
  bio?: string;
  subjects: string[];
  teachingMode: string;
  hourlyRate?: number;
  photoUrl?: string;
}

export default function TutorProfilePage() {
  const { id } = useParams();
  const userId = useSearchParams().get("userId");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState<"demo" | "regular">("demo");

  // 🔹 Fetch tutor info and slots
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const tutorData = await getTutorById(id as string);
        const slotData = await getTutorAvailability(userId as string, bookingType);
        setTutor(tutorData);
        setSlots(slotData);
      } catch (err) {
        console.error("Tutor fetch error:", err);
        toast({
          title: "Error loading tutor",
          description: "Something went wrong while fetching tutor data.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, bookingType]);

  // 🔹 Handle booking a slot
  const handleBookSlot = async (slot: Slot) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in as a student to book a slot.",
      });
      return;
    }

    try {
      const payload = {
        tutorId: tutor?.userId || tutor?._id,
        subject: tutor?.subjects?.[0] || "General",
        date: dayjs(slot.startTime).toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: bookingType,
        amount: bookingType === "regular" ? tutor?.hourlyRate || 0 : 0,
      };

      const res = await createBooking(payload);
      toast({
        title: bookingType === "demo" ? "Demo booked!" : "Class booked!",
        description: "We’ve notified your tutor.",
      });

      // router.push(`/booking/success?bookingId=${res?._id}`);
    } catch (err: any) {
      console.error("Booking Error:", err);
      toast({
        title: "Booking Failed",
        description: err?.message || "Something went wrong while booking.",
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading tutor profile...
      </div>
    );

  if (!tutor)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Tutor not found or unavailable.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={0}
        userRole="student"
      />
      <Sidebar
        userRole="student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar title={tutor.name} subtitle="Tutor Profile & Booking" />

        <main className="p-6 space-y-6">
          {/* Tutor Info */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={tutor.photoUrl || "/default-avatar.png"}
                alt={tutor.name}
                className="w-32 h-32 rounded-full object-cover border"
              />

              <div>
                <h2 className="text-2xl font-semibold">{tutor.name}</h2>
                <p className="text-sm text-muted mt-1">
                  {tutor.qualification || "No qualification info"}
                </p>
                <div className="flex items-center gap-2 text-sm mt-2 text-muted">
                  <Star className="w-4 h-4 text-yellow-500" /> 4.8 Rating
                </div>
                <p className="mt-3 text-gray-700">
                  {tutor.bio || "No bio available"}
                </p>
                <div className="mt-3 text-sm">
                  <strong>Subjects:</strong>{" "}
                  {tutor.subjects?.length ? tutor.subjects.join(", ") : "N/A"}
                </div>
                <div className="text-sm">
                  <strong>Mode:</strong> {tutor.teachingMode}
                </div>
                <div className="text-sm">
                  <strong>Hourly Rate:</strong> ₹{tutor.hourlyRate || 0}
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Section */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> Available Slots
              </h3>

              <div className="flex gap-2">
                <Button
                  variant={bookingType === "demo" ? "default" : "outline"}
                  onClick={() => setBookingType("demo")}
                >
                  Demo (15 min)
                </Button>
                <Button
                  variant={bookingType === "regular" ? "default" : "outline"}
                  onClick={() => setBookingType("regular")}
                >
                  Regular Class
                </Button>
              </div>
            </div>

            {slots.length === 0 ? (
              <div className="text-center text-gray-500">
                No {bookingType} slots available.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {slots.map((slot) => (
                  <Card
                    key={slot._id}
                    className="p-3 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition"
                  >
                    <div className="text-sm font-medium">
                      {dayjs(slot.startTime).format("MMM D, YYYY")}
                    </div>
                    <div className="flex items-center gap-1 text-muted text-sm mt-1">
                      <Clock className="w-4 h-4" />
                      {dayjs(slot.startTime).format("h:mm A")} -{" "}
                      {dayjs(slot.endTime).format("h:mm A")}
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 bg-primary text-white hover:bg-primary/90"
                      onClick={() => handleBookSlot(slot)}
                    >
                      Book {bookingType === "demo" ? "Demo" : "Class"}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
