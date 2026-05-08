'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setTutorKyc } from '@/store/slices/tutorKycSlice';

import { CheckCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

import { getTutorProfile } from '@/services/tutorService';
import { updateTutorPayoutDetails } from '@/services/profileService';

type ReviewStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
type KycStatus = ReviewStatus | 'under_review';

const mapKycStatus = (status?: string): KycStatus => {
  const s = String(status || '').toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  if (s === 'submitted') return 'submitted';
  if (s === 'under_review') return 'under_review';
  return 'pending';
};

const mapReviewStatus = (status?: string): ReviewStatus => {
  const s = String(status || '').toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  if (s === 'submitted') return 'submitted';
  return 'pending';
};

const statusClass = (status: KycStatus | ReviewStatus) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'submitted':
    case 'under_review':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    default:
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  }
};

export default function TutorKycPage() {
  const dispatch = useDispatch();
  const kyc = useSelector((state: RootState) => state.tutorKyc);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allowEditing, setAllowEditing] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);
  const [bankConsent, setBankConsent] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    upiId: '',
    accountHolderName: '',
    bankAccountNumber: '',
    ifsc: '',
  });

  const hasPayoutDetails = Boolean(
    kyc.upiId && kyc.accountHolderName && kyc.bankAccountNumber && kyc.ifsc
  );
  const bankReviewStatus = kyc.payoutDetailsStatus || 'pending';
  const isLocked = ['submitted', 'under_review', 'approved'].includes(bankReviewStatus) && !allowEditing;

  useEffect(() => {
    const fetchKycData = async () => {
      try {
        const profile = await getTutorProfile();
        const profileHasPayout = Boolean(
          profile?.upiId &&
            profile?.accountHolderName &&
            profile?.bankAccountNumber &&
            profile?.ifsc
        );
        const payload = {
          kycStatus: mapKycStatus(profile?.kycStatus),
          payoutDetailsStatus: mapReviewStatus(
            profile?.payoutDetailsStatus || (profileHasPayout ? 'submitted' : 'pending')
          ),
          kycDocumentsStatus: mapReviewStatus(profile?.kycDocumentsStatus),
          aadhaarUrls: profile?.aadhaarUrls || [],
          panUrl: profile?.panUrl || null,
          upiId: String(profile?.upiId || ''),
          accountHolderName: String(profile?.accountHolderName || ''),
          bankAccountNumber: String(profile?.bankAccountNumber || ''),
          ifsc: String(profile?.ifsc || ''),
          kycRejectionReason: String(profile?.kycRejectionReason || ''),
        };
        dispatch(setTutorKyc(payload));
        setPayoutForm({
          upiId: payload.upiId,
          accountHolderName: payload.accountHolderName,
          bankAccountNumber: payload.bankAccountNumber,
          ifsc: payload.ifsc,
        });
      } catch (err) {
        console.error('Failed to load bank verification:', err);
      }
    };

    fetchKycData();
  }, [dispatch]);

  const handlePayoutSubmit = async () => {
    const upiId = payoutForm.upiId.trim();
    const accountHolderName = payoutForm.accountHolderName.trim();
    const bankAccountNumber = payoutForm.bankAccountNumber.trim();
    const ifsc = payoutForm.ifsc.trim().toUpperCase();
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    const bankRegex = /^[0-9]{9,18}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (!upiRegex.test(upiId)) {
      return toast({ title: 'Enter a valid UPI ID', variant: 'destructive' });
    }
    if (accountHolderName.length < 2) {
      return toast({ title: 'Enter account holder name', variant: 'destructive' });
    }
    if (!bankRegex.test(bankAccountNumber)) {
      return toast({ title: 'Enter a valid bank account number', variant: 'destructive' });
    }
    if (!ifscRegex.test(ifsc)) {
      return toast({ title: 'Enter a valid IFSC', variant: 'destructive' });
    }
    if (!bankConsent) {
      return toast({
        title: 'Consent required',
        description: 'Please confirm that you are submitting your bank details with your consent.',
        variant: 'destructive',
      });
    }

    try {
      setSavingPayout(true);
      const res = await updateTutorPayoutDetails({ upiId, accountHolderName, bankAccountNumber, ifsc });
      dispatch(
        setTutorKyc({
          ...kyc,
          kycStatus: mapKycStatus(res?.data?.kycStatus || kyc.kycStatus),
          payoutDetailsStatus: mapReviewStatus(res?.data?.payoutDetailsStatus || 'submitted'),
          upiId,
          accountHolderName,
          bankAccountNumber,
          ifsc,
        })
      );
      setPayoutForm({ upiId, accountHolderName, bankAccountNumber, ifsc });
      setAllowEditing(false);
      setBankConsent(false);
      toast({ title: 'Bank details submitted for verification' });
    } catch (err: any) {
      toast({
        title: 'Unable to save bank details',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingPayout(false);
    }
  };

  const renderPayoutStep = () => (
    <div className="mt-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">UPI ID</label>
          <Input
            className="mt-1"
            value={payoutForm.upiId}
            onChange={(e) => setPayoutForm((prev) => ({ ...prev, upiId: e.target.value }))}
            placeholder="name@bank"
            disabled={isLocked}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Account holder name</label>
          <Input
            className="mt-1"
            value={payoutForm.accountHolderName}
            onChange={(e) => setPayoutForm((prev) => ({ ...prev, accountHolderName: e.target.value }))}
            placeholder="Name as per bank"
            disabled={isLocked}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Bank account number</label>
          <Input
            className="mt-1"
            value={payoutForm.bankAccountNumber}
            onChange={(e) => setPayoutForm((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
            placeholder="1234567890"
            disabled={isLocked}
          />
        </div>
        <div>
          <label className="text-sm font-medium">IFSC</label>
          <Input
            className="mt-1 uppercase"
            value={payoutForm.ifsc}
            onChange={(e) => setPayoutForm((prev) => ({ ...prev, ifsc: e.target.value.toUpperCase() }))}
            placeholder="ABCD0123456"
            disabled={isLocked}
          />
        </div>
      </div>
      {!isLocked && (
        <div className="space-y-4">
          <label className="flex items-start gap-3 rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={bankConsent}
              onChange={(e) => setBankConsent(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              I confirm that I am submitting my own bank details with my consent, and I understand these details will be used for tutor payouts and bank verification.
            </span>
          </label>
          <Button disabled={savingPayout || !bankConsent} onClick={handlePayoutSubmit}>
            <CreditCard className="w-4 h-4 mr-2" />
            {savingPayout ? 'Saving...' : 'Submit Bank Details'}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_90%_-10%,rgba(250,204,21,0.18),transparent),radial-gradient(900px_400px_at_-10%_0%,rgba(37,99,235,0.08),transparent)]">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pr-64">
        <Topbar title="Bank Verification" subtitle="Submit bank details for tutor payout verification" />

        <main className="p-4 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card className="p-6 lg:p-8 rounded-3xl bg-white/90 backdrop-blur border shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Bank Verification</div>
                    <div className="text-sm text-muted-foreground">
                      Add your UPI and bank details for payout review.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Current status</span>
                  <Badge className={`capitalize border ${statusClass(bankReviewStatus)}`}>
                    {bankReviewStatus === 'approved' ? 'verified' : bankReviewStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {bankReviewStatus === 'rejected' && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Bank verification was declined{kyc.kycRejectionReason ? `: ${kyc.kycRejectionReason}` : '. Please update and resubmit.'}
                </div>
              )}

              <div className="mt-6 rounded-lg border p-4 bg-primary/5 border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    {hasPayoutDetails ? <CheckCircle className="w-4 h-4 text-green-600" /> : <CreditCard className="w-4 h-4" />}
                    UPI and bank details
                  </div>
                  <Badge className={`capitalize border ${statusClass(bankReviewStatus)}`}>{bankReviewStatus}</Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Used by admin to verify payout ownership.</div>
              </div>

              {renderPayoutStep()}

              {isLocked && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="text-sm text-slate-700">Bank details are locked while admin review is in progress.</div>
                  <Button variant="outline" onClick={() => setAllowEditing(true)}>
                    Replace Bank Details
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
