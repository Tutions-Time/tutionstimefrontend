'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setTutorKyc } from '@/store/slices/tutorKycSlice';

import { ShieldCheck, Upload } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

import { uploadTutorKyc, getTutorProfile } from '@/services/tutorService';

// ---------------------------------------------
// Build correct image URL (S3 + local compatible)
// ---------------------------------------------
const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://127.0.0.1:5000';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

// ---------------------------------------------
// Map backend value → frontend value
// backend sends: pending | approved | rejected
// ---------------------------------------------
const mapStatus = (status: string): 'pending' | 'approved' | 'rejected' | 'under_review' => {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  if (status === 'submitted') return 'under_review'; // future-proof
  return 'pending';
};

export default function TutorKycPage() {
  const dispatch = useDispatch();
  const { kycStatus, aadhaarUrls, panUrl, bankProofUrl } = useSelector(
    (state: RootState) => state.tutorKyc
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // File Inputs
  const [aadhaarFiles, setAadhaarFiles] = useState<File[]>([]);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // Fetch profile & load KYC
  // ---------------------------------------------
  useEffect(() => {
    const fetchKycData = async () => {
      try {
        const res = await getTutorProfile();

        dispatch(
          setTutorKyc({
            kycStatus: mapStatus(res.profile?.kycStatus),
            aadhaarUrls: res.profile?.aadhaarUrls || [],
            panUrl: res.profile?.panUrl || null,
            bankProofUrl: res.profile?.bankProofUrl || null,
          })
        );
      } catch (err) {
        console.error('Failed to load KYC:', err);
      }
    };

    fetchKycData();
  }, [dispatch]);

  // ---------------------------------------------
  // File input handlers
  // ---------------------------------------------
  const handleAadhaarChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAadhaarFiles(Array.from(e.target.files || []));
  };

  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPanFile(e.target.files?.[0] || null);

  const handleBankChange = (e: ChangeEvent<HTMLInputElement>) =>
    setBankFile(e.target.files?.[0] || null);

  // ---------------------------------------------
  // Submit KYC
  // ---------------------------------------------
  const handleSubmit = async () => {
    if (!aadhaarFiles.length || !panFile ) {
      return toast({
        title: 'Missing Files',
        description: 'Please upload Aadhaar, PAN, and Bank Proof.',
        variant: 'destructive',
      });
    }

    try {
      setLoading(true);

      const formData = new FormData();
      aadhaarFiles.forEach((f) => formData.append('aadhaar', f));
      formData.append('pan', panFile);

      const res = await uploadTutorKyc(formData);
      const data = res.data;

      dispatch(
        setTutorKyc({
          kycStatus: mapStatus(data.kycStatus),
          aadhaarUrls: data.aadhaarUrls || [],
          panUrl: data.panUrl || null,
          bankProofUrl: data.bankProofUrl || null,
        })
      );

      toast({
        title: 'KYC Submitted',
        description: 'Your documents are under review.',
      });
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err?.message || 'Unable to upload documents.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // Render image previews
  // ---------------------------------------------
  const renderImages = () => (
    <div className="grid md:grid-cols-3 gap-4">
      {aadhaarUrls?.map((src, i) => (
        <img
          key={i}
          src={getImageUrl(src)}
          alt={`aadhaar-${i}`}
          className="w-32 h-24 rounded object-cover border"
        />
      ))}

      {panUrl && (
        <img
          src={getImageUrl(panUrl)}
          alt="PAN"
          className="w-32 h-24 rounded object-cover border"
        />
      )}

      {bankProofUrl && (
        <img
          src={getImageUrl(bankProofUrl)}
          alt="Bank Proof"
          className="w-32 h-24 rounded object-cover border"
        />
      )}
    </div>
  );

  // ---------------------------------------------
  // Render upload inputs
  // ---------------------------------------------
  const renderUploadInputs = () => (
    <>
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div>
          <label className="text-sm font-medium">Aadhaar (front/back)</label>
          <Input type="file" multiple onChange={handleAadhaarChange} />
        </div>

        <div>
          <label className="text-sm font-medium">PAN Card</label>
          <Input type="file" onChange={handlePanChange} />
        </div>

        {/* <div>
          <label className="text-sm font-medium">Bank Proof</label>
          <Input type="file" onChange={handleBankChange} />
        </div> */}
      </div>

      <div className="mt-6 flex gap-2">
        <Button variant="outline" disabled={loading} onClick={handleSubmit}>
          <Upload className="w-4 h-4 mr-2" />
          {loading ? 'Uploading...' : 'Submit for Review'}
        </Button>
      </div>
    </>
  );

  // ---------------------------------------------
  // Badge color
  // ---------------------------------------------
  const getStatusBadgeClass = () => {
    switch (kycStatus) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'under_review':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  // ---------------------------------------------
  // MAIN UI RENDER
  // ---------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar title="Verification" subtitle="Upload your KYC documents" />

        <main className="p-4 lg:p-6 space-y-6">
          <Card className="p-6 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>

                <div>
                  <div className="font-semibold">KYC Status</div>
                  <div className="text-sm text-muted">
                    Aadhaar / PAN 
                  </div>
                </div>
              </div>

              <Badge className={`capitalize ${getStatusBadgeClass()}`}>
                {kycStatus.replace('_', ' ')}
              </Badge>
            </div>

            {/* ----------------------------- */}
            {/* CONDITIONAL UI RENDERING      */}
            {/* ----------------------------- */}
            {kycStatus === 'approved' ? (
              <>
                <p className="font-medium mt-6 mb-3">✅ Your KYC is verified.</p>
                {renderImages()}
              </>
            ) : kycStatus === 'under_review' ? (
              <>
                <p className="font-medium mt-6 mb-3">
                  🕓 Your KYC is under review.
                </p>
                {renderImages()}
              </>
            ) : kycStatus === 'rejected' ? (
              <>
                <p className="font-medium mt-6 mb-3 text-red-600">
                  ❌ Your KYC was rejected. Please upload again.
                </p>
                {renderUploadInputs()}
              </>
            ) : (
              // pending
              renderUploadInputs()
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
