'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getAdminRefunds, updateRefundStatus } from '@/services/adminService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminRefundsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const refresh = () => {
    setLoading(true);
    getAdminRefunds()
      .then((data) => setItems(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const act = async (id: string, status: 'approved' | 'rejected' | 'processed') => {
    setUpdating(id);
    try {
      await updateRefundStatus(id, status);
      refresh();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={3} userRole="admin" userName="Admin" />
        <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64">
          <Topbar title="Refund Requests" subtitle="Review and process" />

          <main className="p-3 sm:p-4 lg:p-6 space-y-6">
            <Card className="p-4 sm:p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">Requests</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="p-2">Amount</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 hidden md:table-cell">Reason</th>
                      {/* <th className="p-2 hidden md:table-cell">Type</th> */}
                      {/* <th className="p-2 hidden md:table-cell">Gateway</th> */}
                      <th className="p-2">Student</th>
                      <th className="p-2 hidden md:table-cell">Tutor</th>
                      <th className="p-2 hidden md:table-cell">Course</th>
                      <th className="p-2 hidden md:table-cell">Created</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td className="p-2" colSpan={8}>Loading...</td></tr>
                    ) : items.length ? (
                      items.map((x) => (
                        <tr key={x._id} className="border-t">
                          <td className="p-2">₹{x.amount}</td>
                          <td className="p-2 capitalize">{x.status}</td>
                          <td className="p-2 hidden md:table-cell">{x.reasonCode || x.reason || ''}</td>
                          {/* <td className="p-2 hidden md:table-cell">{x.paymentType || '—'}</td> */}
                          {/* <td className="p-2 hidden md:table-cell">{x.paymentGateway || '—'}</td> */}
                          <td className="p-2">{x?.studentName || x?.paymentId?.studentId?.name || x?.userId?.name || '—'}</td>
                          <td className="p-2 hidden md:table-cell">{x?.tutorName || x?.paymentId?.tutorId?.name || '—'}</td>
                          <td className="p-2 hidden md:table-cell">{x?.courseLabel || '—'}</td>
                          <td className="p-2 hidden md:table-cell">{new Date(x.createdAt).toLocaleString()}</td>
                          <td className="p-2 space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelected(x);
                                setShowDetails(true);
                              }}
                            >
                              View
                            </Button>
                            {/* <Button size="sm" disabled={updating === x._id} onClick={() => act(x._id, 'approved')}>Approve</Button>
                            <Button size="sm" variant="destructive" disabled={updating === x._id} onClick={() => act(x._id, 'rejected')}>Reject</Button>
                            <Button size="sm" variant="outline" disabled={updating === x._id} onClick={() => act(x._id, 'processed')}>Process</Button> */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="p-2" colSpan={8}>No requests</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </main>
        </div>
        <Dialog open={showDetails} onOpenChange={(v) => setShowDetails(v)}>
          <DialogContent className="w-[95vw] sm:w-auto sm:max-w-xl lg:max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Refund Details</DialogTitle>
              <DialogDescription>Review all information and take action</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-muted">Refund ID</div>
                  <div className="font-medium break-all">{selected?._id}</div>
                </div>
                <div>
                  <div className="text-muted">Status</div>
                  <div className="font-medium capitalize">{selected?.status}</div>
                </div>
                <div>
                  <div className="text-muted">Requested Amount</div>
                  <div className="font-medium">₹{Number(selected?.amount || 0)}</div>
                </div>
                <div>
                  <div className="text-muted">Approved Amount</div>
                  <div className="font-medium">₹{Number(selected?.amountApproved || 0)}</div>
                </div>
                <div>
                  <div className="text-muted">Suggested Amount</div>
                  <div className="font-medium">₹{Number(selected?.suggestedAmount || 0)}</div>
                </div>
                <div>
                  <div className="text-muted">Method</div>
                  <div className="font-medium">{selected?.method || '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-muted">Reason Code</div>
                  <div className="font-medium break-all">{selected?.reasonCode || '—'}</div>
                </div>
                <div>
                  <div className="text-muted">Reason Text</div>
                  <div className="font-medium">{selected?.reasonText || selected?.reason || '—'}</div>
                </div>
                <div>
                  <div className="text-muted">Completion %</div>
                  <div className="font-medium">
                    {selected?.completionPercentage != null
                      ? `${Math.round(Number(selected?.completionPercentage) * 100)}%`
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-muted">Refundable Cap</div>
                  <div className="font-medium">₹{Number(selected?.refundableCap || 0)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-muted">Payment Type</div>
                  <div className="font-medium">{selected?.paymentType || '—'}</div>
                </div>
                <div>
                  <div className="text-muted">Payment Amount</div>
                  <div className="font-medium">₹{Number(selected?.paymentAmount || 0)}</div>
                </div>
                <div>
                  <div className="text-muted">Gateway</div>
                  <div className="font-medium">{selected?.paymentGateway || '—'}</div>
                </div>
                <div>
                  <div className="text-muted">Student</div>
                  <div className="font-medium">{selected?.studentName || selected?.paymentId?.studentId?.name || selected?.userId?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-muted">Tutor</div>
                  <div className="font-medium">{selected?.tutorName || selected?.paymentId?.tutorId?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-muted">Course</div>
                  <div className="font-medium">
                    {selected?.courseLabel ||
                      selected?.paymentId?.regularClassId?.subject ||
                      selected?.paymentId?.groupBatchId?.subject ||
                      selected?.paymentId?.noteId?.title ||
                      '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-muted">Created At</div>
                  <div className="font-medium">
                    {selected?.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-muted">Processed At</div>
                  <div className="font-medium">
                    {selected?.processedAt ? new Date(selected.processedAt).toLocaleString() : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-muted">Provider Refund Id</div>
                  <div className="font-medium break-all">{selected?.providerRefundId || '—'}</div>
                </div>
                <div>
                  <div className="text-muted">Provider Status</div>
                  <div className="font-medium">{selected?.providerStatus || '—'}</div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                size="sm"
                onClick={() => {
                  if (!selected?._id) return;
                  act(selected._id, 'approved');
                }}
                disabled={updating === selected?._id}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (!selected?._id) return;
                  act(selected._id, 'rejected');
                }}
                disabled={updating === selected?._id}
              >
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!selected?._id) return;
                  act(selected._id, 'processed');
                }}
                disabled={updating === selected?._id}
              >
                Process
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetails(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
