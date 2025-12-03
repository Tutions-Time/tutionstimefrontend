"use client";
import { useEffect, useMemo, useState } from "react";
import { listBatches, reserveSeat, createGroupOrder, verifyGroupPayment } from "@/services/groupBatchService";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";

export default function GroupBatchesPage() {
  const enabled = String(process.env.NEXT_PUBLIC_FEATURE_GROUP_BATCHES || "false").toLowerCase() === "true";
  const [filters, setFilters] = useState<{ subject?: string; level?: string; date?: string }>({});
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            router.refresh();
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

  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Group Batches" subtitle="Find and join group classes" action={
          <Button onClick={()=>setFilters({})} variant="outline">Clear Filters</Button>
        } />
        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="border p-2 rounded" placeholder="Subject" value={filters.subject||""} onChange={(e)=>setFilters({ ...filters, subject: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Level" value={filters.level||""} onChange={(e)=>setFilters({ ...filters, level: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Date (YYYY-MM-DD)" value={filters.date||""} onChange={(e)=>setFilters({ ...filters, date: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((b:any)=> (
              <div key={b._id} className="border rounded p-4 flex flex-col gap-2 bg-white shadow-sm">
                <div className="font-medium">{b.subject} • {b.level || "General"}</div>
                <div className="text-sm">Type: {b.batchType}</div>
                <div className="text-sm">Price: ₹{b.pricePerStudent}</div>
                <div className="text-sm">Seats left: {b.liveSeats}</div>
                <Button disabled={loading || b.liveSeats<=0} onClick={()=>reserveAndPay(b._id)} className="disabled:opacity-50">{loading ? "Processing..." : "Join"}</Button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

