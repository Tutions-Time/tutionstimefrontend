'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setTutorKyc } from '@/store/slices/tutorKycSlice';

import { CheckCircle, CreditCard, FileText, ShieldCheck, Upload } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

import { uploadTutorKyc, getTutorProfile } from '@/services/tutorService';
import { updateTutorPayoutDetails } from '@/services/profileService';

type ReviewStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
type KycStatus = ReviewStatus | 'under_review';

const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path;
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://127.0.0.1:5000';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

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

const isPdf = (value: string) => value.toLowerCase().includes('.pdf');

export default function TutorKycPage() {
  const dispatch = useDispatch();
  const kyc = useSelector((state: RootState) => state.tutorKyc);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [aadhaarFiles, setAadhaarFiles] = useState<File[]>([]);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [allowEditing, setAllowEditing] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    upiId: '',
    accountHolderName: '',
    bankAccountNumber: '',
    ifsc: '',
  });

  const hasPayoutDetails = Boolean(
    kyc.upiId && kyc.accountHolderName && kyc.bankAccountNumber && kyc.ifsc
  );
  const hasDocuments = Boolean(kyc.aadhaarUrls?.length && kyc.panUrl);
  const isLocked = ['submitted', 'under_review', 'approved'].includes(kyc.kycStatus) && !allowEditing;

  const aadhaarPreviewUrls = useMemo(
    () => aadhaarFiles.map((file) => URL.createObjectURL(file)),
    [aadhaarFiles]
  );
  const panPreviewUrl = useMemo(
    () => (panFile ? URL.createObjectURL(panFile) : null),
    [panFile]
  );

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
        const profileHasDocuments = Boolean(profile?.aadhaarUrls?.length && profile?.panUrl);
        const payload = {
          kycStatus: mapKycStatus(profile?.kycStatus),
          payoutDetailsStatus: mapReviewStatus(
            profile?.payoutDetailsStatus || (profileHasPayout ? 'submitted' : 'pending')
          ),
          kycDocumentsStatus: mapReviewStatus(
            profile?.kycDocumentsStatus || (profileHasDocuments ? 'submitted' : 'pending')
          ),
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
        setActiveStep(payload.upiId && payload.accountHolderName && payload.bankAccountNumber && payload.ifsc ? 2 : 1);
      } catch (err) {
        console.error('Failed to load KYC:', err);
      }
    };

    fetchKycData();
  }, [dispatch]);

  useEffect(() => {
    return () => {
      aadhaarPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      if (panPreviewUrl) URL.revokeObjectURL(panPreviewUrl);
    };
  }, [aadhaarPreviewUrls, panPreviewUrl]);

  const handleAadhaarChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAadhaarFiles(Array.from(e.target.files || []));
  };

  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPanFile(e.target.files?.[0] || null);
  };

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
      setActiveStep(2);
      toast({ title: 'Payment details saved' });
    } catch (err: any) {
      toast({
        title: 'Unable to save payment details',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingPayout(false);
    }
  };

  const handleDocumentsSubmit = async () => {
    if (!aadhaarFiles.length || !panFile) {
      return toast({
        title: 'Missing documents',
        description: 'Upload Aadhaar and PAN before submitting.',
        variant: 'destructive',
      });
    }

    try {
      setUploadingDocs(true);
      const formData = new FormData();
      aadhaarFiles.forEach((f) => formData.append('aadhaar', f));
      formData.append('pan', panFile);
      const server = await uploadTutorKyc(formData);

      dispatch(
        setTutorKyc({
          ...kyc,
          kycStatus: mapKycStatus(server?.kycStatus),
          payoutDetailsStatus: mapReviewStatus(server?.payoutDetailsStatus),
          kycDocumentsStatus: mapReviewStatus(server?.kycDocumentsStatus || 'submitted'),
          aadhaarUrls: server?.aadhaarUrls || [],
          panUrl: server?.panUrl || null,
          kycRejectionReason: String(server?.kycRejectionReason || ''),
        })
      );
      setAadhaarFiles([]);
      setPanFile(null);
      setAllowEditing(false);
      toast({ title: hasPayoutDetails ? 'KYC submitted for review' : 'Documents saved' });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.message || 'Unable to upload documents.',
        variant: 'destructive',
      });
    } finally {
      setUploadingDocs(false);
    }
  };

  const renderDocument = (src: string, label: string) => {
    const url = getImageUrl(src);
    if (isPdf(url)) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-28 items-center justify-center rounded border bg-slate-50 text-sm text-primary hover:underline"
        >
          View {label}
        </a>
      );
    }
    return <img src={url} alt={label} className="h-28 w-full rounded object-cover border" />;
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
        <Button disabled={savingPayout} onClick={handlePayoutSubmit}>
          <CreditCard className="w-4 h-4 mr-2" />
          {savingPayout ? 'Saving...' : 'Save and Continue'}
        </Button>
      )}
    </div>
  );

  const renderDocumentStep = () => {
    const aadhaarSources =
      aadhaarPreviewUrls.length > 0
        ? aadhaarPreviewUrls
        : (kyc.aadhaarUrls || []).map((src) => getImageUrl(src));
    const panSource = panPreviewUrl || (kyc.panUrl ? getImageUrl(kyc.panUrl) : null);

    return (
      <div className="mt-6 space-y-4">
        {!hasPayoutDetails && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Add payment details in Step 1 before final KYC review.
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Aadhaar front/back</div>
                <div className="text-xs text-muted-foreground">Images or PDF</div>
              </div>
              {aadhaarFiles.length > 0 && <Badge className="bg-blue-100 text-blue-700">{aadhaarFiles.length} selected</Badge>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {aadhaarSources.length > 0 ? (
                aadhaarSources.slice(0, 2).map((url, index) => (
                  <div key={`${url}-${index}`}>{renderDocument(url, `Aadhaar ${index + 1}`)}</div>
                ))
              ) : (
                <div className="col-span-2 flex h-28 items-center justify-center rounded border border-dashed text-xs text-slate-500">
                  No Aadhaar uploaded yet
                </div>
              )}
            </div>
            {!isLocked && <Input className="mt-3" type="file" multiple accept="image/*,application/pdf" onChange={handleAadhaarChange} />}
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">PAN card</div>
                <div className="text-xs text-muted-foreground">Image or PDF</div>
              </div>
              {panFile && <Badge className="bg-blue-100 text-blue-700">Selected</Badge>}
            </div>
            <div className="mt-3">
              {panSource ? (
                renderDocument(panSource, 'PAN')
              ) : (
                <div className="flex h-28 items-center justify-center rounded border border-dashed text-xs text-slate-500">
                  No PAN uploaded yet
                </div>
              )}
            </div>
            {!isLocked && <Input className="mt-3" type="file" accept="image/*,application/pdf" onChange={handlePanChange} />}
          </div>
        </div>
        {!isLocked && (
          <Button disabled={uploadingDocs} onClick={handleDocumentsSubmit}>
            <Upload className="w-4 h-4 mr-2" />
            {uploadingDocs ? 'Uploading...' : 'Submit KYC Documents'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_90%_-10%,rgba(250,204,21,0.18),transparent),radial-gradient(900px_400px_at_-10%_0%,rgba(37,99,235,0.08),transparent)]">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pr-64">
        <Topbar title="Verification" subtitle="Complete payment details and KYC documents" />

        <main className="p-4 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card className="p-6 lg:p-8 rounded-3xl bg-white/90 backdrop-blur border shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Tutor KYC</div>
                    <div className="text-sm text-muted-foreground">
                      Step 1: UPI and bank details. Step 2: identity verification.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Current status</span>
                  <Badge className={`capitalize border ${statusClass(kyc.kycStatus)}`}>
                    {kyc.kycStatus === 'approved' ? 'verified' : kyc.kycStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {kyc.kycStatus === 'rejected' && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  KYC was declined{kyc.kycRejectionReason ? `: ${kyc.kycRejectionReason}` : '. Please update and resubmit.'}
                </div>
              )}

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`text-left rounded-lg border p-4 ${activeStep === 1 ? 'border-primary bg-primary/5' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      {hasPayoutDetails ? <CheckCircle className="w-4 h-4 text-green-600" /> : <CreditCard className="w-4 h-4" />}
                      Step 1: UPI and bank details
                    </div>
                    <Badge className={`capitalize border ${statusClass(kyc.payoutDetailsStatus)}`}>{kyc.payoutDetailsStatus}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Used by admin to verify payout ownership.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`text-left rounded-lg border p-4 ${activeStep === 2 ? 'border-primary bg-primary/5' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      {hasDocuments ? <CheckCircle className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4" />}
                      Step 2: KYC verification
                    </div>
                    <Badge className={`capitalize border ${statusClass(kyc.kycDocumentsStatus)}`}>{kyc.kycDocumentsStatus}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Upload Aadhaar and PAN for identity review.</div>
                </button>
              </div>

              {activeStep === 1 ? renderPayoutStep() : renderDocumentStep()}

              {isLocked && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="text-sm text-slate-700">Details are locked while admin review is in progress.</div>
                  <Button variant="outline" onClick={() => setAllowEditing(true)}>
                    Replace Details
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
