"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Star, XCircle, Users } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "@/hooks/use-toast";
import {
  getMyBookings,
  addRatingAndFeedback,
  cancelBooking,
  getMySubscriptions,
} from "@/services/studentService";

import {
  convertBookingToRegular,
  verifyBookingPayment,
  createSubscriptionCheckout,
  verifySubscriptionPayment, // updated signature
} from "@/services/razorpayService";

export default function StudentSessions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"demo" | "regular">("demo");
  const [ratingModal, setRatingModal] = useState<{
    id: string;
    rating: number;
    feedback: string;
  } | null>(null);

  const fetchAll = async () => {
    try {
      const [b, s] = await Promise.all([getMyBookings(), getMySubscriptions()]);
      setSessions(b);
      setSubs(s);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading sessions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Convert demo → regular (one-time) ---
  const handleConvertToRegular = async (bookingId: string) => {
    try {
      const { order } = await convertBookingToRegular(bookingId);

      if (!order?.id) {
        toast({ title: "Payment init failed", variant: "destructive" });
        return;
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY) {
        toast({ title: "Razorpay key missing", variant: "destructive" });
        return;
      }
      if (!(window as any).Razorpay) {
        toast({ title: "Razorpay SDK not loaded", variant: "destructive" });
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "TuitionTime",
        description: "Regular Class Payment",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await verifyBookingPayment(bookingId, response);
            toast({ title: "✅ Regular class confirmed!" });
            fetchAll();
          } catch {
            toast({ title: "Verification failed", variant: "destructive" });
          }
        },
        theme: { color: "#207EA9" },
      };
      const rz = new (window as any).Razorpay(options);
      rz.open();
    } catch {
      toast({ title: "Payment failed", variant: "destructive" });
    }
  };

  // --- Subscription flow (corrected: create order → pay → verify -> create sub) ---
  const handleStartSubscription = async ({
    tutorId,
    subject,
  }: {
    tutorId: string;
    subject: string;
  }) => {
    try {
      const res = await createSubscriptionCheckout({
        tutorId,
        planType: "monthly",
        sessionsPerWeek: 2,
        subject,
      });

      // res = { success, order, meta }
      if (!res?.order?.id) {
        toast({
          title: res?.message || "Checkout failed",
          variant: "destructive",
        });
        return;
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY) {
        toast({ title: "Razorpay key missing", variant: "destructive" });
        return;
      }
      if (!(window as any).Razorpay) {
        toast({ title: "Razorpay SDK not loaded", variant: "destructive" });
        return;
      }

      const { order, meta } = res;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "TuitionTime",
        description: "Monthly Subscription",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await verifySubscriptionPayment(response, meta);
            if (verifyRes?.success) {
              toast({ title: "🎉 Subscription active!" });
              fetchAll();
            } else {
              toast({
                title: verifyRes?.message || "Verification failed",
                variant: "destructive",
              });
            }
          } catch {
            toast({ title: "Verification failed", variant: "destructive" });
          }
        },
        theme: { color: "#207EA9" },
      };

      const rz = new (window as any).Razorpay(options);
      rz.open();
    } catch {
      toast({ title: "Checkout failed", variant: "destructive" });
    }
  };

  // --- Rating flow ---
  const handleAddRating = async () => {
    if (!ratingModal) return;
    try {
      await addRatingAndFeedback(ratingModal.id, {
        rating: ratingModal.rating,
        feedback: ratingModal.feedback,
      });
      toast({ title: "Thanks for your feedback!" });
      setRatingModal(null);
      fetchAll();
    } catch {
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    }
  };

  // --- Cancel booking ---
  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      toast({ title: "Booking cancelled" });
      fetchAll();
    } catch {
      toast({ title: "Cancel failed", variant: "destructive" });
    }
  };

  // --- Filter logic ---
  const filteredSessions = sessions.filter((s) => {
    if (activeTab === "demo") return s.type === "demo";
    if (activeTab === "regular")
      return s.type === "regular" || s.subscriptionId;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="student"
      />
      <Sidebar
        userRole="student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="My Sessions"
          subtitle="View and manage your learning journey"
        />

        <main className="p-4 lg:p-6 space-y-5">
          {loading && (
            <p className="text-center text-gray-500 py-8">
              Loading your sessions...
            </p>
          )}

          {!loading && subs.length > 0 && (
            <Card className="p-5 border-0 bg-gradient-to-r from-[#E3F2FD] to-[#F1F8E9] shadow-md">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  Active Subscriptions:{" "}
                  <strong className="text-primary">
                    {subs.filter((s: any) => s.status === "active").length}
                  </strong>
                </span>
              </div>
            </Card>
          )}

          {/* === Animated Toggle Tabs === */}
          <div className="flex justify-center mb-6">
            <div className="relative bg-white border border-gray-200 rounded-full shadow-sm flex w-[260px] p-1">
              {/* Animated highlight */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`absolute top-1 bottom-1 w-[125px] rounded-full bg-primary/10 border border-primary/30 shadow-sm ${
                  activeTab === "demo" ? "left-1" : "left-[130px]"
                }`}
              />

              {["demo", "regular"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`relative z-10 flex-1 text-sm font-medium rounded-full py-2 transition-colors duration-200 ${
                    activeTab === tab
                      ? "text-primary font-semibold"
                      : "text-gray-500 hover:text-primary/80"
                  }`}
                >
                  {tab === "demo" ? "Demo Classes" : "Regular Classes"}
                </button>
              ))}
            </div>
          </div>

          {/* === Filtered Sessions === */}
          {!loading && filteredSessions.length === 0 && (
            <Card className="p-10 text-center shadow-md border border-dashed border-gray-300">
              <p className="text-gray-500">No {activeTab} classes found yet.</p>
            </Card>
          )}

          <div className="grid gap-5">
            {filteredSessions.map((s) => (
              <Card
                key={s._id}
                className="p-6 bg-white border border-gray-100 rounded-2xl shadow hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {s.tutorId?.name}
                    </h3>
                    <p className="text-sm text-gray-500">{s.subject}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        {dayjs(s.startTime).format("MMM D, YYYY")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        {dayjs(s.startTime).format("h:mm A")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      className={
                        s.status === "confirmed"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : s.status === "completed"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : s.status === "cancelled"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }
                    >
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">
                      {s.subscriptionId
                        ? "Subscription Class"
                        : s.type === "demo"
                        ? "Demo"
                        : "Regular"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {/* Subscribe Monthly */}
                  {s.type === "demo" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleStartSubscription({
                          tutorId: s.tutorId?._id || s.tutorId,
                          subject: s.subject,
                        })
                      }
                    >
                      Subscribe Monthly
                    </Button>
                  )}

                  {/* Join Now */}
                  {s.status === "confirmed" && s.zoomLink && (
                    <Button
                      onClick={() => window.open(s.zoomLink, "_blank")}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      <Video className="w-4 h-4 mr-2" /> Join Now
                    </Button>
                  )}

                  {/* Cancel */}
                  {["pending", "confirmed"].includes(s.status) && (
                    <Button
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleCancel(s._id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  )}

                  {/* Upgrade to Regular (only after demo completion) */}
                  {s.type === "demo" && s.status === "completed" && (
                    <Button
                      onClick={() => handleConvertToRegular(s._id)}
                      className="bg-primary text-white"
                    >
                      Upgrade to Regular
                    </Button>
                  )}

                  {/* Rating (only for completed regular) */}
                  {s.status === "completed" &&
                    !s.rating &&
                    s.type === "regular" && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setRatingModal({ id: s._id, rating: 0, feedback: "" })
                        }
                      >
                        <Star className="w-4 h-4 mr-2 text-yellow-500" /> Rate
                        this Class
                      </Button>
                    )}
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
