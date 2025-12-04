"use client";
import { useEffect, useMemo, useState } from "react";
import { listBatches, reserveSeat, createGroupOrder, verifyGroupPayment } from "@/services/groupBatchService";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import GroupSessionsModal from "@/components/group-batches/GroupSessionsModal";

export default function StudentGroupBatches() {
  const [filters, setFilters] = useState<{ subject?: string; level?: string; date?: string }>({});
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

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

  const openRazorpay = async (order: any, batchId: string) => {
    if ((window as any).rzp_instance) {
      (window as any).rzp_instance.close();
      (window as any).rzp_instance = null;
    }
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
      name: "TuitionTime",
      description: "Group Batch Payment",
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
    (window as any).rzp_instance = rzp;
    rzp.open();
    rzp.on("payment.failed", () => {
      (window as any).rzp_instance = null;
    });
  };

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

  const reserveAndPay = async (batchId: string) => {
    try {
      const res = await reserveSeat(batchId);
      if (!res?.success) {
        toast.error("Reservation failed");
        return;
      }
      const order = await createGroupOrder({ batchId, reservationId: res.reservationId });
      if (!order?.success) {
        toast.error("Order creation failed");
        return;
      }
      await openRazorpay(order, batchId);
    } catch (e: any) {
      toast.error(e.message || "Join failed");
    }
  };

  const list = useMemo(() => items || [], [items]);

  const getSessionJoinData = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const classDurationMin = 60;
    const joinBeforeMin = 5;
    const expireAfterMin = 5;
    const end = start + classDurationMin * 60 * 1000;
    const openAt = start - joinBeforeMin * 60 * 1000;
    const closeAt = end + expireAfterMin * 60 * 1000;
    const now = Date.now();
    const canJoin = now >= openAt && now <= closeAt;
    const isExpired = now > closeAt;
    return { canJoin, isExpired };
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
      const url = res.data?.url;
      if (url) window.open(url, "_blank");
    } catch (e: any) {}
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="border p-2 rounded" placeholder="Subject" value={filters.subject||""} onChange={(e)=>setFilters({ ...filters, subject: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Level" value={filters.level||""} onChange={(e)=>setFilters({ ...filters, level: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Date (YYYY-MM-DD)" value={filters.date||""} onChange={(e)=>setFilters({ ...filters, date: e.target.value })} />
      </div>
      <div className="flex justify-end">
        <Button onClick={()=>setFilters({})} variant="outline">Clear Filters</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((b:any)=> (
          <div key={b._id} className="border rounded p-4 flex flex-col gap-2 bg-white shadow-sm">
            <div className="font-medium">{b.subject} • {b.level || "General"}</div>
            <div className="text-sm">Type: {b.batchType}</div>
            <div className="text-sm">Price: ₹{b.pricePerStudent}</div>
            <div className="text-sm">Seats left: {b.liveSeats}</div>
            <div className="flex gap-2">
              {!b.isEnrolledForCurrentUser && (
                <Button disabled={loading || b.liveSeats<=0} onClick={()=>reserveAndPay(b._id)} className="disabled:opacity-50">{loading ? "Processing..." : "Join"}</Button>
              )}
              {b.isEnrolledForCurrentUser && (
                <Button variant="outline" onClick={()=>openSessionsModal(b._id)}>View Sessions</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <GroupSessionsModal
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        sessions={sessions}
        loading={sessionsLoading}
        onJoin={(id) => joinSession(id)}
        getSessionJoinData={getSessionJoinData}
      />
    </>
  );
}

