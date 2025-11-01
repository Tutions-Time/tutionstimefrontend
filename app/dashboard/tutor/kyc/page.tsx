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

// ✅ Helper for building correct image URLs
const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://127.0.0.1:5000';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function TutorKycPage() {
  const dispatch = useDispatch();
  const { kycStatus, aadhaarUrls, panUrl, bankProofUrl } = useSelector(
    (state: RootState) => state.tutorKyc
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aadhaarFiles, setAadhaarFiles] = useState<File[]>([]);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 🧠 Fetch KYC data on mount
  useEffect(() => {
    const fetchKycData = async () => {
      try {
        const profile = await getTutorProfile();
        dispatch(
          setTutorKyc({
            kycStatus: profile.kycStatus || 'pending',
            aadhaarUrls: profile.aadhaarUrls || [],
            panUrl: profile.panUrl || null,
            bankProofUrl: profile.bankProofUrl || null,
          })
        );
      } catch (error: any) {
        console.error('Failed to load KYC info:', error.message);
      }
    };
    fetchKycData();
  }, [dispatch]);

  // 📂 File Handlers
  const handleAadhaarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAadhaarFiles(files);
  };
  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPanFile(e.target.files?.[0] || null);
  const handleBankChange = (e: ChangeEvent<HTMLInputElement>) =>
    setBankFile(e.target.files?.[0] || null);

  // 🧩 Submit handler
  const handleSubmit = async () => {
    if (!aadhaarFiles.length || !panFile || !bankFile) {
      return toast({
        title: 'Missing files',
        description: 'Please upload all required documents.',
        variant: 'destructive',
      });
    }

    try {
      setLoading(true);
      const formData = new FormData();
      aadhaarFiles.forEach((f) => formData.append('aadhaar', f));
      formData.append('pan', panFile);
      formData.append('bankProof', bankFile);

      const res = await uploadTutorKyc(formData);
      const data = res.data;

      // ✅ Update Redux
      dispatch(
        setTutorKyc({
          kycStatus: data.kycStatus || 'submitted',
          aadhaarUrls: data.aadhaarUrls || [],
          panUrl: data.panUrl || null,
          bankProofUrl: data.bankProofUrl || null,
        })
      );

      toast({
        title: 'KYC Submitted',
        description: 'Your KYC documents have been submitted for review.',
      });
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Unable to upload KYC right now.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = () => {
    switch (kycStatus) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                  <div className="text-sm text-muted">Aadhaar / PAN / Bank Proof</div>
                </div>
              </div>
              <Badge className={`capitalize ${getStatusBadgeClass()}`}>{kycStatus}</Badge>
            </div>

            {/* ✅ Display existing KYC images */}
            {kycStatus === 'approved' || kycStatus === 'submitted' ? (
              <div className="mt-6">
                <p className="font-medium mb-3">
                  {kycStatus === 'approved'
                    ? '✅ Your KYC is verified.'
                    : '🕓 Your KYC is under review.'}
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  {Array.isArray(aadhaarUrls) &&
                    aadhaarUrls.map((src, i) => (
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
              </div>
            ) : (
              <>
                {/* Upload Fields */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <label className="text-sm font-medium">Aadhaar (front/back)</label>
                    <Input type="file" multiple onChange={handleAadhaarChange} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">PAN Card</label>
                    <Input type="file" onChange={handlePanChange} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bank Proof (Passbook/Cheque)</label>
                    <Input type="file" onChange={handleBankChange} />
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button variant="outline" disabled={loading} onClick={handleSubmit}>
                    <Upload className="w-4 h-4 mr-2" />
                    {loading ? 'Uploading...' : 'Submit for Review'}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
