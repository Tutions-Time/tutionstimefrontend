"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getTutorById,
  getTutorAvailability,
  createBooking,
  getMySubscriptions,
} from "@/services/studentService";
import {
  createSubscriptionCheckout,
  verifySubscriptionPayment,
} from "@/services/razorpayService";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Star, Lock } from "lucide-react";
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
  monthlyRate?: number;
  photoUrl?: string;
}

export default function TutorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId"); // ✅ Extracted userId from search params

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState<"demo" | "regular">("demo");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ✅ Fetch tutor info, slots, and subscription status
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id || !userId) return;

        const tutorData = await getTutorById(id as string);
        setTutor(tutorData);

        // ✅ Check active subscriptions for this tutor
        const subs = await getMySubscriptions();
        const subscribed = subs?.some(
          (sub: any) => sub.tutorId === userId && sub.status === "active"
        );
        setIsSubscribed(subscribed);

        // ✅ Fetch demo slots
        const slotData = await getTutorAvailability(userId, "demo");
        setSlots(slotData);
      } catch (err) {
        console.error("Tutor fetch error:", err);
        toast({
          title: "Error loading tutor",
          description: "Something went wrong while fetching tutor data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  // ✅ Handle booking demo slot
  const handleBookSlot = async (slot: Slot) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in as a student to book a slot.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: {
        tutorId: string;
        subject: string;
        date: string;
        startTime: string;
        endTime: string;
        type: "demo" | "regular";
        amount?: number;
      } = {
        tutorId: userId || tutor?.userId || tutor?._id || "",
        subject: tutor?.subjects?.[0] || "General",
        date: dayjs(slot.startTime).toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: "demo",
        amount: 0,
      };

      const res = await createBooking(payload);
      toast({
        title: "Demo Booked!",
        description: "We’ve notified your tutor.",
      });

      router.push(
        `/dashboard/student/search/tutor/booking/success?bookingId=${res?.booking?._id}`
      );
    } catch (err: any) {
      console.error("Booking Error:", err);
      toast({
        title: "Booking Failed",
        description: err?.message || "Something went wrong while booking.",
        variant: "destructive",
      });
    }
  };

  // ✅ Handle subscription checkout flow
  const handleStartSubscription = async () => {
    try {
      const res = await createSubscriptionCheckout({
        tutorId: userId || tutor?.userId || tutor?._id || "",
        planType: "monthly",
        sessionsPerWeek: 2,
        subject: tutor?.subjects?.[0] || "General",
      });

      if (!res?.order?.id) {
        toast({ title: "Checkout failed", variant: "destructive" });
        return;
      }

      if (!(window as any).Razorpay) {
        toast({ title: "Razorpay SDK not loaded", variant: "destructive" });
        return;
      }

      const { order } = res;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "TuitionTime",
        description: `Subscription for ${tutor?.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await verifySubscriptionPayment(response, {
              tutorId: userId || tutor?.userId || tutor?._id || "",
              planType: "monthly",
              sessionsPerWeek: 2,
              subject: tutor?.subjects?.[0] || "General",
            });

            if (verifyRes?.success) {
              toast({ title: "🎉 Subscription activated!" });
              setIsSubscribed(true);
            } else {
              toast({
                title: verifyRes?.message || "Verification failed",
                variant: "destructive",
              });
            }
          } catch {
            toast({
              title: "Verification failed",
              variant: "destructive",
            });
          }
        },
        theme: { color: "#207EA9" },
      };

      const rz = new (window as any).Razorpay(options);
      rz.open();
    } catch (err) {
      console.error("Subscription Error:", err);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
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
        <Topbar title={tutor.name} subtitle="Tutor Profile & Subscription" />

        <main className="p-6 space-y-6">
          {/* Tutor Info */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={tutor.photoUrl || "/default-avatar.png"}
                alt={tutor.name}
                className="w-32 h-32 rounded-full object-cover border"
              />

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{tutor.name}</h2>
                    <p className="text-sm text-muted mt-1">
                      {tutor.qualification || "No qualification info"}
                    </p>
                    <div className="flex items-center gap-2 text-sm mt-2 text-muted">
                      <Star className="w-4 h-4 text-yellow-500" /> 4.8 Rating
                    </div>
                  </div>

                  {!isSubscribed ? (
                    <Button
                      className="bg-primary text-white hover:bg-primary/90"
                      onClick={handleStartSubscription}
                    >
                      Subscribe Monthly ₹
                      {tutor.monthlyRate ? tutor.monthlyRate : 1}
                    </Button>
                  ) : (
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Subscribed
                    </div>
                  )}
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

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="relative bg-white border border-gray-200 rounded-full shadow-sm flex w-[280px] p-1">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`absolute top-1 bottom-1 w-[135px] rounded-full bg-primary/10 border border-primary/30 shadow-sm ${
                  bookingType === "demo" ? "left-1" : "left-[142px]"
                }`}
              />
              {["demo", "regular"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBookingType(tab as "demo" | "regular")}
                  className={`relative z-10 flex-1 text-sm font-medium rounded-full py-2 transition-colors duration-200 ${
                    bookingType === tab
                      ? "text-primary font-semibold"
                      : "text-gray-500 hover:text-primary/80"
                  }`}
                >
                  {tab === "demo" ? "Demo Classes" : "Regular Classes"}
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm">
            {bookingType === "regular" && !isSubscribed ? (
              <div className="flex flex-col items-center text-center py-10 text-gray-500">
                <Lock className="w-10 h-10 mb-3 text-gray-400" />
                <p className="text-sm">
                  Please subscribe to access this tutor’s regular classes.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    {bookingType === "demo"
                      ? "Available Demo Slots"
                      : "Regular Classes"}
                  </h3>
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
                        className="p-3 flex flex-col items-center text-center hover:shadow-md transition"
                      >
                        <div className="text-sm font-medium">
                          {dayjs(slot.startTime).format("MMM D, YYYY")}
                        </div>
                        <div className="flex items-center gap-1 text-muted text-sm mt-1">
                          <Clock className="w-4 h-4" />
                          {dayjs(slot.startTime).format("h:mm A")} -{" "}
                          {dayjs(slot.endTime).format("h:mm A")}
                        </div>

                        {bookingType === "demo" && (
                          <Button
                            size="sm"
                            className="mt-3 bg-primary text-white hover:bg-primary/90"
                            onClick={() => handleBookSlot(slot)}
                          >
                            Book Demo
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
