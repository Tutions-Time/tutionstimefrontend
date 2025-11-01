'use client';

import { useEffect, useState } from 'react';
import { Wallet as WalletIcon, Download } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMyWallet, getMyTransactions } from '@/services/walletService';
import { toast } from '@/hooks/use-toast';

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch wallet + transactions on load
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const walletRes = await getMyWallet();
        const txRes = await getMyTransactions();
        setWallet(walletRes);
        setTransactions(txRes);
      } catch (err: any) {
        console.error('Wallet fetch error:', err);
        toast({
          title: 'Failed to load wallet data',
          description: err.message || 'Something went wrong.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const balance = wallet?.balance ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole={wallet?.role || 'student'}
      />
      <Sidebar
        userRole={wallet?.role || 'student'}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="Wallet"
          subtitle="Your balance and transactions"
          action={
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Wallet Balance */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted">Current Balance</div>
                <div className="text-2xl font-bold">
                  ₹{balance.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Role: {wallet?.role === 'tutor' ? 'Tutor' : 'Student'}
                </div>
              </div>
            </div>
          </Card>

          {/* Transactions */}
          <Card className="overflow-x-auto bg-white rounded-2xl shadow-sm">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No transactions yet.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id} className="border-t">
                      <td className="px-4 py-3">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {t.description || '—'}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {t.type}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${
                          t.type === 'credit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {t.type === 'credit' ? '+' : '-'}₹
                        {Math.abs(t.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
