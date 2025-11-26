"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, IndianRupee } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

import {
  searchNotes,
  getPurchasedNotes,
  createNoteOrder,
  verifyNotePayment,
  getDownloadUrl,
} from "@/services/noteService";

export default function NotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search
  const [q, setQ] = useState("");

  // Notes
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<"purchased" | "all">("purchased");

  const fetchPurchased = async () => {
    try {
      const res = await getPurchasedNotes();
      setPurchased(res.data || []);
    } catch {}
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await searchNotes({ q, page: 1, limit: 12 });
      setAllNotes(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchased();
    fetchAll();
  }, []);

  const purchasedIds = useMemo(
    () => new Set(purchased.map((p: any) => String(p?.note?._id))),
    [purchased]
  );

  const buy = async (note: any) => {
    try {
      const orderRes = await createNoteOrder(String(note._id));

      if (!orderRes?.orderId || !orderRes?.key) {
        toast({ title: "Payment init failed", variant: "destructive" });
        return;
      }

      if (!(window as any).Razorpay) {
        toast({
          title: "Razorpay SDK not loaded",
          variant: "destructive",
        });
        return;
      }

      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: "INR",
        name: "TuitionTime",
        description: "Paid Note",
        order_id: orderRes.orderId,
        handler: async (response: any) => {
          const verify = await verifyNotePayment(
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            String(note._id)
          );

          if (verify?.success) {
            toast({ title: "Purchased" });
            fetchPurchased();
          } else {
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

  const download = async (noteId: string) => {
    try {
      const res = await getDownloadUrl(noteId);
      if (res?.url) window.open(res.url, "_blank");
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
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
          title="Notes"
          subtitle="Search & purchase premium curated notes"
        />

        <main className="p-4 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Search Bar — Slightly Bigger */}
            <div className="p-2 rounded-2xl bg-transparent">
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Search by subject, class, board, title…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="
                    h-14
                    flex-1
                    rounded-2xl
                    bg-white/0 
                    border border-gray-300
                    shadow-md
                    text-base
                    focus:ring-2 focus:ring-blue-300
                    placeholder:text-gray-500
                  "
                />

                <Button
                  onClick={fetchAll}
                  className="
                    h-14 px-7 rounded-2xl
                    bg-yellow-400
                    hover:bg-yellow-500
                    text-black
                    text-base
                    font-semibold
                    shadow-[0_3px_10px_rgba(0,0,0,0.15)]
                    flex items-center gap-2
                  "
                >
                  <Search className="w-5 h-5" />
                  Search
                </Button>
              </div>
            </div>

            {/* Tabs — Slightly Bigger */}
            <div className="flex justify-center">
              <div className="flex p-2 bg-white/60 backdrop-blur-xl rounded-full border border-white/40 shadow-inner gap-1">
                <button
                  onClick={() => setActiveTab("purchased")}
                  className={`px-8 py-3 text-base font-medium rounded-full transition-all duration-300 ${
                    activeTab === "purchased"
                      ? "bg-white shadow-md text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  Purchased
                </button>

                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-8 py-3 text-base font-medium rounded-full transition-all duration-300 ${
                    activeTab === "all"
                      ? "bg-white shadow-md text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  All Notes
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "purchased" ? (
              <>
                <div className="text-xl font-semibold">Purchased Notes</div>

                {purchased.length === 0 && (
                  <Card className="p-6 text-center text-base text-gray-600 bg-white/70 backdrop-blur-xl rounded-2xl">
                    No purchased notes yet.
                  </Card>
                )}

                {purchased.map((p: any) => (
                  <Card
                    key={p?.note?._id}
                    className="p-6 bg-white/90 backdrop-blur-xl rounded-3xl border shadow-lg flex items-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border bg-gray-100 shadow-inner">
                      <iframe src={p?.note?.pdfUrl} className="w-full h-full" />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-base truncate">
                        {p?.note?.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {p?.note?.subject} • {p?.note?.classLevel} •{" "}
                        {p?.note?.board}
                      </div>

                      <Badge className="mt-2 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md">
                        Paid ₹{p?.purchase?.amount}
                      </Badge>
                    </div>

                    <Button
                      size="lg"
                      className="text-sm px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => download(p?.note?._id)}
                    >
                      Download
                    </Button>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">All Notes</div>

                {allNotes.map((n: any) => (
                  <Card
                    key={n._id}
                    className="p-6 bg-white/90 backdrop-blur-xl rounded-3xl border shadow-lg flex items-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border bg-gray-100 shadow-inner">
                      <iframe src={n.pdfUrl} className="w-full h-full" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="font-semibold text-base truncate">
                        {n.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {n.subject} • {n.classLevel} • {n.board}
                      </div>

                      <div className="text-base font-semibold flex items-center gap-1 mt-1 text-blue-700">
                        <IndianRupee className="w-4 h-4" />
                        {n.price}
                      </div>
                    </div>

                    {purchasedIds.has(String(n._id)) ? (
                      <Button
                        size="lg"
                        className="text-sm px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => download(n._id)}
                      >
                        Download
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="text-sm px-5 py-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 font-medium"
                        onClick={() => buy(n)}
                      >
                        Buy Now
                      </Button>
                    )}
                  </Card>
                ))}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
