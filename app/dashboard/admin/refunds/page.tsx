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

export default function AdminRefundsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

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

          <main className="p-4 lg:p-6 space-y-6">
            <Card className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">Requests</div>
                <Link href="/dashboard/admin/transactions">
                  <Button variant="outline">Transactions</Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="p-2">Amount</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Reason</th>
                      <th className="p-2">Created</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td className="p-2" colSpan={5}>Loading...</td></tr>
                    ) : items.length ? (
                      items.map((x) => (
                        <tr key={x._id} className="border-t">
                          <td className="p-2">₹{x.amount}</td>
                          <td className="p-2 capitalize">{x.status}</td>
                          <td className="p-2">{x.reason || ''}</td>
                          <td className="p-2">{new Date(x.createdAt).toLocaleString()}</td>
                          <td className="p-2 space-x-2">
                            <Button size="sm" disabled={updating === x._id} onClick={() => act(x._id, 'approved')}>Approve</Button>
                            <Button size="sm" variant="destructive" disabled={updating === x._id} onClick={() => act(x._id, 'rejected')}>Reject</Button>
                            <Button size="sm" variant="outline" disabled={updating === x._id} onClick={() => act(x._id, 'processed')}>Process</Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="p-2" colSpan={5}>No requests</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
