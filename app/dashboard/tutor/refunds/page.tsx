"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { getTutorRefunds, submitTutorRefundReview } from "@/services/tutorService";

export default function TutorRefundsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<"legal" | "illegal">("legal");
  const [tutorDescription, setTutorDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTutorRefunds();
      setItems(data || []);
    } catch (err: any) {
      toast({ title: "Failed to load refunds", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openReview = (row: any) => {
    setSelected(row);
    setDecision((row?.tutorDecision === "illegal" ? "illegal" : "legal"));
    setTutorDescription(String(row?.tutorDescription || ""));
    setOpen(true);
  };

  const submit = async () => {
    if (!selected?._id) return;
    if (tutorDescription.trim().length < 5) {
      toast({ title: "Description required", description: "Please write at least 5 characters", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await submitTutorRefundReview(selected._id, { decision, tutorDescription: tutorDescription.trim() });
      toast({ title: "Review submitted" });
      setOpen(false);
      await load();
    } catch (err: any) {
      toast({ title: "Failed to submit review", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
        <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pr-64">
          <Topbar title="Refund Requests" subtitle="Review student refund claims" />
          <main className="p-4 lg:p-6">
            <Card className="p-4 sm:p-6">
              <div className="text-lg font-semibold mb-4">Requests</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="p-2">Student</th>
                      <th className="p-2">Course</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Reason</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Your Decision</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td className="p-2" colSpan={8}>Loading...</td></tr>
                    ) : items.length ? (
                      items.map((x) => (
                        <tr key={x._id} className="border-t">
                          <td className="p-2">{x.studentName || "—"}</td>
                          <td className="p-2">{x.courseLabel || "—"}</td>
                          <td className="p-2">₹{Number(x.amount || 0)}</td>
                          <td className="p-2">{x.reasonCode || "—"}</td>
                          <td className="p-2 max-w-[280px] truncate" title={x.reasonText || x.reason || ""}>
                            {x.reasonText || x.reason || "—"}
                          </td>
                          <td className="p-2 capitalize">{x.tutorDecision || "pending"}</td>
                          <td className="p-2 capitalize">{x.status}</td>
                          <td className="p-2">
                            <Button size="sm" variant="outline" onClick={() => openReview(x)}>
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="p-2" colSpan={8}>No refund requests</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </main>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tutor Review</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="text-sm">
                <div><span className="text-muted">Student:</span> {selected?.studentName || "—"}</div>
                <div><span className="text-muted">Course:</span> {selected?.courseLabel || "—"}</div>
                <div><span className="text-muted">Requested Amount:</span> ₹{Number(selected?.amount || 0)}</div>
              </div>

              <div>
                <label className="text-sm font-medium">Decision</label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as "legal" | "illegal")}
                >
                  <option value="legal">Legal</option>
                  <option value="illegal">Illegal</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Tutor Description</label>
                <textarea
                  rows={4}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={tutorDescription}
                  onChange={(e) => setTutorDescription(e.target.value)}
                  placeholder="Write your review for admin"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}

