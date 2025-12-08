'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getAdminAllPaymentHistory } from '@/services/razorpayService';

export default function AdminTransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAdminAllPaymentHistory()
      .then((data) => setItems(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={3} userRole="admin" userName="Admin" />
        <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64">
          <Topbar title="Transactions" subtitle="Payment history and references" />

          <main className="p-4 lg:p-6 space-y-6">
            <Card className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">All Payments</div>
                <Link href="/dashboard/admin/revenue">
                  <Button variant="outline">Revenue</Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="p-2">Type</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td className="p-2" colSpan={4}>Loading...</td></tr>
                    ) : items.length ? (
                      items.map((x) => (
                        <tr key={x._id} className="border-t">
                          <td className="p-2 capitalize">{x.type}</td>
                          <td className="p-2">₹{x.amount}</td>
                          <td className="p-2 capitalize">{x.status}</td>
                          <td className="p-2">{new Date(x.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="p-2" colSpan={4}>No records</td></tr>
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
