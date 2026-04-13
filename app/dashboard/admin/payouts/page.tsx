'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, CreditCard, IndianRupee, RefreshCw, Search } from 'lucide-react';
import QRCode from 'qrcode';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getAdminTutorPayables, markTutorPayablePaid } from '@/services/razorpayService';

type PayoutRow = {
  payoutId?: string;
  tutorId: string;
  tutorUserId?: string;
  tutorName: string;
  tutorEmail?: string;
  kycStatus?: string;
  sourcePaymentIds?: string[];
  sourceCount: number;
  grossAmount: number;
  refundAmount?: number;
  commissionAmount: number;
  payableAmount: number;
  status: 'pending' | 'settled';
  latestPaymentAt?: string;
  paidAt?: string;
  note?: string;
  requestType?: 'earnings' | 'withdrawal';
  upiId?: string;
  bank?: {
    accountHolderName?: string;
    bankAccountNumber?: string;
    maskedAccountNumber?: string;
    ifsc?: string;
  } | null;
};

const inr = (value: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export default function AdminTutorPayoutsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [totals, setTotals] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState<PayoutRow | null>(null);
  const [note, setNote] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [marking, setMarking] = useState(false);

  const pendingMode = status === 'pending';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminTutorPayables({
        status,
        q: query.trim() || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setRows(res.data || []);
      setTotals(res.totals || {});
    } catch (err: any) {
      toast({
        title: 'Failed to load tutor payouts',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [from, query, status, to]);

  useEffect(() => {
    load();
  }, [load]);

  const pageSummary = useMemo(
    () => [
      {
        label: pendingMode ? 'Tutors to pay' : 'Paid payouts',
        value: String(totals?.tutors || rows.length || 0),
        icon: pendingMode ? Clock : CheckCircle,
      },
      {
        label: 'Collected amount',
        value: inr(Number(totals?.grossAmount || 0)),
        icon: IndianRupee,
      },
      {
        label: 'Platform cut',
        value: inr(Number(totals?.commissionAmount || 0)),
        icon: CreditCard,
      },
      {
        label: pendingMode ? 'Amount to pay' : 'Amount paid',
        value: inr(Number(totals?.payableAmount || 0)),
        icon: IndianRupee,
      },
    ],
    [pendingMode, rows.length, totals],
  );

  const openMarkPaid = (row: PayoutRow) => {
    setSelected(row);
    setNote('');
    setQrDataUrl('');
  };

  const buildUpiUrl = useCallback((row: PayoutRow, noteText = '') => {
    if (!row.upiId) return '';
    const params = new URLSearchParams({
      pa: row.upiId,
      pn: row.tutorName || 'Tutor',
      am: Number(row.payableAmount || 0).toFixed(2),
      cu: 'INR',
      tn: noteText.trim() || `Tutor payout ${row.tutorName || ''}`.trim(),
    });
    return `upi://pay?${params.toString()}`;
  }, []);

  useEffect(() => {
    let alive = true;
    const generate = async () => {
      if (!selected?.upiId || !pendingMode) {
        setQrDataUrl('');
        return;
      }
      try {
        const url = await QRCode.toDataURL(buildUpiUrl(selected, note), {
          width: 260,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
        if (alive) setQrDataUrl(url);
      } catch {
        if (alive) setQrDataUrl('');
      }
    };
    generate();
    return () => {
      alive = false;
    };
  }, [buildUpiUrl, note, pendingMode, selected]);

  const submitMarkPaid = async () => {
    if (!selected) return;
    if (!window.confirm(`Mark ${inr(selected.payableAmount)} paid to ${selected.tutorName}?`)) {
      return;
    }

    try {
      setMarking(true);
      await markTutorPayablePaid(selected.tutorId, {
        sourcePaymentIds: selected.sourcePaymentIds || [],
        payoutId: selected.payoutId,
        note: note.trim(),
      });
      toast({ title: 'Tutor marked paid', description: `${selected.tutorName} was notified.` });
      setSelected(null);
      setNote('');
      await load();
    } catch (err: any) {
      toast({
        title: 'Failed to mark paid',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="admin" userName="Admin" />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pr-64">
        <Topbar title="Tutor Payouts" subtitle="Review pending tutor payments and mark manual transfers paid" greeting />

        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {pageSummary.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="p-5 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted">{item.label}</div>
                      <div className="text-xl font-semibold">{item.value}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <Input
                  className="pl-9"
                  placeholder="Search tutor, email, UPI"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}
              >
                <option value="pending">Pending payouts</option>
                <option value="paid">Paid history</option>
              </select>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              <Button variant="outline" onClick={load} disabled={loading}>
                <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </Card>

          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Tutor</th>
                  <th className="px-4 py-3">Sources</th>
                  <th className="px-4 py-3">Collected</th>
                  <th className="px-4 py-3">25% Cut</th>
                  <th className="px-4 py-3">Pay Tutor</th>
                  <th className="px-4 py-3">Payout Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.tutorId}-${row.payoutId || 'pending'}`} className="border-t">
                    <td className="px-4 py-4">
                      <div className="font-medium">{row.tutorName}</div>
                      <div className="text-xs text-muted">{row.tutorEmail || 'No email'}</div>
                      {row.kycStatus && (
                        <Badge className="mt-2 capitalize bg-slate-100 text-slate-700 border-slate-200">
                          KYC {row.kycStatus}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {row.requestType === 'withdrawal' ? 'Withdrawal request' : `${row.sourceCount || 0} payments`}
                      </div>
                      <div className="text-xs text-muted">
                        {pendingMode ? `Latest ${formatDate(row.latestPaymentAt)}` : `Paid ${formatDate(row.paidAt)}`}
                      </div>
                    </td>
                    <td className="px-4 py-4">{inr(row.grossAmount)}</td>
                    <td className="px-4 py-4">{inr(row.commissionAmount)}</td>
                    <td className="px-4 py-4 font-semibold text-green-700">{inr(row.payableAmount)}</td>
                    <td className="px-4 py-4">
                      {row.upiId ? (
                        <div>
                          <div className="font-medium">UPI</div>
                          <div className="text-xs text-muted break-all">{row.upiId}</div>
                        </div>
                      ) : row.bank ? (
                        <div>
                          <div className="font-medium">{row.bank.accountHolderName || 'Bank'}</div>
                          <div className="text-xs text-muted">
                            {row.bank.maskedAccountNumber || 'Account'} · {row.bank.ifsc || 'IFSC'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">No payout details</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          'capitalize border',
                          pendingMode
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-green-100 text-green-700 border-green-200',
                        )}
                      >
                        {pendingMode ? 'pending' : 'paid'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {pendingMode ? (
                        <Button size="sm" onClick={() => openMarkPaid(row)} disabled={!row.upiId && !row.bank}>
                          Pay
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => openMarkPaid(row)} disabled>
                          Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted">
                      {pendingMode ? 'No pending tutor payouts.' : 'No paid payout history found.'}
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted">
                      Loading tutor payouts...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </main>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6 sm:!max-w-2xl lg:!max-w-4xl">
          <DialogHeader>
            <DialogTitle>{pendingMode ? 'Pay Tutor' : 'Payout Details'}</DialogTitle>
            <DialogDescription>
              {selected ? `${selected.tutorName} · ${inr(selected.payableAmount)}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <div className="text-muted">Collected</div>
                  <div className="font-semibold">{inr(selected.grossAmount)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted">Platform cut</div>
                  <div className="font-semibold">{inr(selected.commissionAmount)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted">Tutor receives</div>
                  <div className="text-lg font-semibold text-green-700">{inr(selected.payableAmount)}</div>
                </div>
              </div>

              <div className="rounded-lg border bg-slate-50 p-3 text-sm">
                <div className="font-medium mb-1">Payout details</div>
                {selected.upiId ? (
                  <div>UPI: {selected.upiId}</div>
                ) : selected.bank ? (
                  <div>
                    {selected.bank.accountHolderName || 'Bank account'} · {selected.bank.maskedAccountNumber} · {selected.bank.ifsc}
                  </div>
                ) : (
                  <div className="text-red-600">No payout details submitted.</div>
                )}
              </div>

              {pendingMode && selected.upiId && (
                <div className="rounded-lg border bg-white p-4 text-center">
                  <div className="text-sm font-medium">Scan to pay by UPI</div>
                  <div className="mt-1 text-xs text-muted">
                    QR includes {selected.upiId} and {inr(selected.payableAmount)}.
                  </div>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`UPI QR for ${selected.tutorName}`}
                      className="mx-auto mt-3 h-auto w-full max-w-[220px] rounded border bg-white p-2 sm:max-w-[240px]"
                    />
                  ) : (
                    <div className="mx-auto mt-3 flex h-52 w-full max-w-[220px] items-center justify-center rounded border text-xs text-muted sm:max-w-[240px]">
                      Generating QR...
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(buildUpiUrl(selected, note));
                          toast({ title: 'UPI payment link copied' });
                        } catch {
                          toast({ title: 'Copy failed', variant: 'destructive' });
                        }
                      }}
                    >
                      Copy UPI Link
                    </Button>
                    {qrDataUrl && (
                      <a href={qrDataUrl} download={`upi-qr-${selected.tutorName || 'tutor'}.png`}>
                        <Button variant="outline" size="sm" type="button">
                          Download QR
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {pendingMode && !selected.upiId && selected.bank && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  QR code is available for UPI payouts. Use the bank details above for this tutor.
                </div>
              )}

              <div>
                <label className="text-sm font-medium">
                  Note to tutor {pendingMode ? '(optional)' : ''}
                </label>
                <textarea
                  className="mt-1 min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Example: Paid for March classes via UPI."
                  value={pendingMode ? note : selected.note || ''}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!pendingMode}
                />
                {pendingMode && (
                  <div className="mt-1 text-xs text-muted">
                    This note is included in the tutor notification and email.
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            {pendingMode && (
              <Button onClick={submitMarkPaid} disabled={marking || !selected}>
                {marking ? 'Paying...' : 'Pay'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
