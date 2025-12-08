'use client';

import { useEffect, useState } from 'react';
import { Wallet as WalletIcon, Download, IndianRupee } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMyWallet, getMyTransactions } from '@/services/walletService';
import { requestPayout } from '@/services/tutorService';
import { toast } from '@/hooks/use-toast';

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawing, setWithdrawing] = useState(false);

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
  const pendingBalance = wallet?.pendingBalance ?? 0;

  async function refresh() {
    const walletRes = await getMyWallet();
    const txRes = await getMyTransactions();
    setWallet(walletRes);
    setTransactions(txRes);
  }

  async function handleWithdraw() {
    try {
      if (wallet?.role !== 'tutor') {
        toast({ title: 'Only tutors can withdraw', variant: 'destructive' });
        return;
      }
      const amt = Number(withdrawAmount);
      if (!amt || isNaN(amt) || amt <= 0) {
        toast({ title: 'Enter a valid amount', variant: 'destructive' });
        return;
      }
      if (amt < 10) {
        toast({ title: 'Minimum payout is ₹10', variant: 'destructive' });
        return;
      }
      if (amt > Number(balance || 0)) {
        toast({ title: 'Amount exceeds available balance', variant: 'destructive' });
        return;
      }
      setWithdrawing(true);
      const res = await requestPayout(amt);
      if (res?.success) {
        toast({ title: 'Payout requested successfully' });
        setWithdrawAmount("");
        await refresh();
      } else {
        toast({ title: res?.message || 'Payout request failed', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Payout request failed', description: err.message, variant: 'destructive' });
    } finally {
      setWithdrawing(false);
    }
  }

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

            {wallet?.role === 'tutor' && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-sm text-muted">Amount (₹)</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    type="number"
                    min={10}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                  <div className="text-xs text-gray-500 mt-1">Minimum ₹10</div>
                </div>
                <div className="flex">
                  <Button className="ml-auto" onClick={handleWithdraw} disabled={withdrawing}>
                    {withdrawing ? 'Requesting…' : 'Withdraw'}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Pending Balance for Tutors */}
          {wallet?.role === 'tutor' && (
            <Card className="p-6 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <WalletIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-muted">Pending (Locked) Balance</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    ₹{pendingBalance.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Auto-release occurs ~30 days after class period end
                  </div>
                </div>
              </div>
            </Card>
          )}

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
                    <th className="px-4 py-3">Status</th>
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
                      <td className="px-4 py-3">
                        {t.status === 'locked' ? (
                          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                            Locked
                          </span>
                        ) : t.status === 'completed' ? (
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                            {t.status || '—'}
                          </span>
                        )}
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
