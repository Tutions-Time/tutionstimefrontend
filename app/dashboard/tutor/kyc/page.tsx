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

// Build correct image URL for S3 / local
const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://127.0.0.1:5000';

  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function TutorKycPage() {
  const dispatch = useDispatch();
  const { kycStatus, aadhaarUrls, panUrl } = useSelector(
    (state: RootState) => state.tutorKyc
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aadhaarFiles, setAadhaarFiles] = useState<File[]>([]);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTutorProfile(); // returns { user, profile, roleDetails }

        const profile = res?.profile;
        const role = res?.roleDetails;

        const backendStatus =
          profile?.kycStatus ||
          role?.kycStatus ||
          'pending';

        dispatch(
          setTutorKyc({
            kycStatus: backendStatus.toLowerCase(),
            aadhaarUrls: profile?.aadhaarUrls || [],
            panUrl: profile?.panUrl || null,
          })
        );
      } catch (err) {
        console.log('Error:', err);
      }
    };

    load();
  }, [dispatch]);

  // Handlers
  const handleAadhaarChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAadhaarFiles(Array.from(e.target.files || []));
  };

  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPanFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async () => {
    if (!aadhaarFiles.length || !panFile) {
      return toast({
        title: 'Missing Documents',
        description: 'Please upload Aadhaar & PAN.',
        variant: 'destructive',
      });
    }

    try {
      setLoading(true);

      const formData = new FormData();
      aadhaarFiles.forEach((f) => formData.append('aadhaar', f));
      formData.append('pan', panFile);

      const res = await uploadTutorKyc(formData);
      const server = res?.data?.data;

      dispatch(
        setTutorKyc({
          kycStatus: server?.kycStatus?.toLowerCase(),
          aadhaarUrls: server?.aadhaarUrls || [],
          panUrl: server?.panUrl || null,
        })
      );

      toast({
        title: 'Submitted Successfully',
        description: 'Your KYC documents are under review.',
      });
    } catch (err: any) {
      toast({
        title: 'KYC Upload Failed',
        description: err?.message || 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /** RENDER HELPERS **/
  const renderImages = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {aadhaarUrls?.map((src, i) => (
        <img
          key={i}
          src={getImageUrl(src)}
          alt={`aadhaar-${i}`}
          className="w-32 h-24 rounded-xl object-cover border border-slate-200 shadow-sm"
        />
      ))}
      {panUrl && (
        <img
          src={getImageUrl(panUrl)}
          alt="PAN"
          className="w-32 h-24 rounded-xl object-cover border border-slate-200 shadow-sm"
        />
      )}
    </div>
  );

  const renderInputs = () => (
    <>
      <div className="grid gap-4 mt-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Aadhaar (front & back)
          </label>
          <Input
            type="file"
            multiple
            onChange={handleAadhaarChange}
            className="cursor-pointer border-slate-200"
          />
          <p className="text-xs text-slate-400">
            JPG / PNG, up to 5 MB each.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            PAN Card
          </label>
          <Input
            type="file"
            onChange={handlePanChange}
            className="cursor-pointer border-slate-200"
          />
          <p className="text-xs text-slate-400">
            Make sure details are clearly visible.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          disabled={loading}
          onClick={handleSubmit}
          className="rounded-full px-5"
        >
          <Upload className="w-4 h-4 mr-2" />
          {loading ? 'Uploading…' : 'Submit for Review'}
        </Button>
      </div>
    </>
  );

  const getStatusBadgeClass = () => {
    switch (kycStatus) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'rejected':
        return 'bg-red-50 text-red-700 border border-red-100';
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="tutor"
      />
      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar title="Verification" subtitle="KYC & compliance" />

        {/* Centered, narrower content */}
        <main className="p-4 lg:p-8 flex justify-center">
          <div className="w-full max-w-4xl">
            <Card className="p-6 md:p-8 rounded-3xl bg-white shadow-sm border border-slate-100">
              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-slate-900">
                      KYC Status
                    </div>
                    <div className="text-sm text-slate-500">
                      Aadhaar / PAN Verification
                    </div>
                  </div>
                </div>

                <Badge
                  className={`capitalize rounded-full px-4 py-1 text-xs font-medium ${getStatusBadgeClass()}`}
                >
                  {kycStatus?.replace('_', ' ')}
                </Badge>
              </div>

              {/* Content based on status */}
              {kycStatus === 'approved' && (
                <div className="mt-6 md:mt-10">
                  <div className="flex flex-wrap gap-6 md:gap-10 items-center justify-start">
                    {aadhaarUrls?.map((src, i) => (
                      <img
                        key={i}
                        src={getImageUrl(src)}
                        alt={`aadhaar-${i}`}
                        className="w-40 h-32 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                    ))}

                    {panUrl && (
                      <img
                        src={getImageUrl(panUrl)}
                        alt="PAN"
                        className="w-40 h-32 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                    )}
                  </div>
                </div>
              )}


              {kycStatus === 'under_review' && (
                <div className="mt-6 md:mt-8">
                  <p className="text-sm md:text-base text-blue-700 font-medium">
                    🕓 Your documents have been submitted and are currently under
                    review. We will notify you once verification is complete.
                  </p>
                  {renderImages()}
                </div>
              )}

              {kycStatus === 'rejected' && (
                <div className="mt-6 md:mt-8">
                  <p className="text-sm md:text-base text-red-600 font-medium">
                    ❌ Your KYC was rejected. Please re-upload valid documents so
                    our team can verify your identity.
                  </p>
                  {renderInputs()}
                </div>
              )}

              {kycStatus === 'pending' && (
                <div className="mt-6 md:mt-8">
                  <p className="text-sm md:text-base text-slate-600">
                    To start receiving payments, please complete your KYC by
                    uploading your Aadhaar and PAN card.
                  </p>
                  {renderInputs()}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
