"use client";
import { useEffect, useMemo, useState } from "react";
import {
  listBatches,
  reserveSeat,
  createGroupOrder,
  verifyGroupPayment,
} from "@/services/groupBatchService";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import GroupSessionsModal from "@/components/group-batches/GroupSessionsModal";
import { Calendar, Users, IndianRupee, Video } from "lucide-react";

export default function StudentGroupBatches() {
  const [filters, setFilters] = useState<{ subject?: string; level?: string; date?: string }>({});
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [couponMap, setCouponMap] = useState<Record<string, string>>({});

  // --------------------------
  // Razorpay Loader
  // --------------------------
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existing = document.getElementById("razorpay-js");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "razorpay-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  // --------------------------
  // Payment
  // --------------------------
  const openRazorpay = async (order: any, batchId: string) => {
    delete (window as any).Razorpay;
    await loadRazorpayScript();

    if (!(window as any).Razorpay) {
      toast.error("Unable to load Razorpay");
      return;
    }

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "TuitionsTime",
      description: "Batch Payment",
      order_id: order.orderId,
      handler: async (response: any) => {
        try {
          const verifyRes = await verifyGroupPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            batchId,
          });

          if (verifyRes?.success) {
            toast.success("Enrollment confirmed");
            await fetchData();
          } else {
            toast.error("Verification failed");
          }
        } catch (e: any) {
          toast.error(e.message || "Verification failed");
        }
      },
      theme: { color: "#207EA9" },
    } as any;

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // --------------------------
  // Fetch Batches
  // --------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await listBatches(filters as any);
      setItems(data);
    } catch (e: any) {
      toast.error(e.message || "Unable to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.subject, filters.level, filters.date]);

  // --------------------------
  // Reserve + Pay
  // --------------------------
  const reserveAndPay = async (batchId: string) => {
    try {
      const res = await reserveSeat(batchId);
      if (!res?.success) {
        toast.error("Reservation failed");
        return;
      }

      const order = await createGroupOrder({
        batchId,
        reservationId: res.reservationId,
        couponCode: couponMap[batchId]?.trim(),
      });

      if (!order?.success) {
        toast.error("Order creation failed");
        return;
      }

      await openRazorpay(order, batchId);
    } catch (e: any) {
      toast.error(e.message || "Join failed");
    }
  };

  // --------------------------
  // Sessions Modal
  // --------------------------
  const getSessionJoinData = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const duration = 60;
    const joinBefore = 5;
    const expireAfter = 5;

    const end = start + duration * 60 * 1000;
    const openAt = start - joinBefore * 60 * 1000;
    const closeAt = end + expireAfter * 60 * 1000;

    const now = Date.now();

    return {
      canJoin: now >= openAt && now <= closeAt,
      isExpired: now > closeAt,
    };
  };

  const openSessionsModal = async (batchId: string) => {
    try {
      setSelectedBatchId(batchId);
      setSessionsModalOpen(true);
      setSessionsLoading(true);

      const res = await api.get(`/group-batches/${batchId}/sessions`);
      setSessions(res.data?.data || []);
    } finally {
      setSessionsLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      if (res.data?.url) window.open(res.data.url, "_blank");
    } catch { }
  };

  // --------------------------
  // UI
  // --------------------------
  const list = useMemo(() => items || [], [items]);

  return (
    <>
      {/* ---------------- / BATCH LIST ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((b: any) => (
          <div
            key={b._id}
            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition p-3 flex flex-col gap-2 w-full"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold">{b.subject}</div>
                <div className="text-[11px] text-gray-500">{b.level || "General"}</div>
              </div>

              {b.isEnrolledForCurrentUser ? (
                <span className="text-[10px] px-2 py-[2px] rounded-full bg-green-100 text-green-700">
                  Enrolled
                </span>
              ) : (
                <span className="text-[10px] px-2 py-[2px] rounded-full bg-blue-100 text-blue-700">
                  Available
                </span>
              )}
            </div>

            {/* Info */}
            <div className="space-y-1 text-[12px]">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {b.fixedDates?.length ?? 0} dates
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" /> Seats Left: {b.liveSeats}
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> {b.pricePerStudent}
              </div>
              <div className="flex items-center gap-1">
                <Video className="w-3 h-3" /> Online Class
              </div>
            </div>

            {/* Small CTA Buttons */}
            <div className="flex flex-wrap gap-2 mt-1">
              {!b.isEnrolledForCurrentUser ? (
                <>
                <input
                  placeholder="Coupon"
                  value={couponMap[b._id] || ""}
                  onChange={(e) => setCouponMap((m) => ({ ...m, [b._id]: e.target.value }))}
                  className="h-8 px-2 text-xs border rounded"
                />
                <Button
                  disabled={loading || b.liveSeats <= 0}
                  onClick={() => reserveAndPay(b._id)}
                  className="flex-1 h-8 px-3 text-xs bg-primary text-black"
                >
                  {loading ? "Processing..." : "Join Now"}
                </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => openSessionsModal(b._id)}
                  className="flex-1 h-8 px-3 text-xs"
                >
                  View Sessions
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* ---------------- / SESSIONS MODAL ---------------- */}
      <GroupSessionsModal
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        sessions={sessions}
        loading={sessionsLoading}
        onJoin={joinSession}
        getSessionJoinData={getSessionJoinData}
      />
    </>
  );
}
