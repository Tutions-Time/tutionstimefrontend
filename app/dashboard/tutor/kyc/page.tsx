'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
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

// Build image URL
const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://127.0.0.1:5000';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Map backend to frontend status
const mapStatus = (
  status: string
): 'pending' | 'submitted' | 'approved' | 'rejected' | 'under_review' => {
  if (!status) return 'pending';

  const s = status.toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  if (s === 'submitted') return 'submitted';
  if (s === 'under_review') return 'under_review';

  return 'pending';
};

export default function TutorKycPage() {
  const dispatch = useDispatch();
  const { kycStatus, aadhaarUrls, panUrl } = useSelector(
    (state: RootState) => state.tutorKyc
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aadhaarFiles, setAadhaarFiles] = useState<File[]>([]);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [allowEditing, setAllowEditing] = useState(false);

  const [loading, setLoading] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchKycData = async () => {
      try {
        const profile = await getTutorProfile();

        dispatch(
          setTutorKyc({
            kycStatus: mapStatus(profile?.kycStatus),
            aadhaarUrls: profile?.aadhaarUrls || [],
            panUrl: profile?.panUrl || null
          })
        );
      } catch (err) {
        console.error('Failed to load KYC:', err);
      }
    };

    fetchKycData();
  }, [dispatch]);

  // File inputs
  const handleAadhaarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      toast({
        title: 'Only images allowed',
        description: 'Please upload JPG or PNG files.',
        variant: 'destructive',
      });
    }
    setAadhaarFiles(imageFiles);
  };

  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) {
      toast({
        title: 'Only images allowed',
        description: 'Please upload a JPG or PNG file.',
        variant: 'destructive',
      });
      setPanFile(null);
      return;
    }
    setPanFile(file);
  };

  const aadhaarPreviewUrls = useMemo(
    () => aadhaarFiles.map((file) => URL.createObjectURL(file)),
    [aadhaarFiles]
  );
  const panPreviewUrl = useMemo(
    () => (panFile ? URL.createObjectURL(panFile) : null),
    [panFile]
  );

  useEffect(() => {
    return () => {
      aadhaarPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      if (panPreviewUrl) URL.revokeObjectURL(panPreviewUrl);
    };
  }, [aadhaarPreviewUrls, panPreviewUrl]);

  // Submit KYC
  const handleSubmit = async () => {
    if (!aadhaarFiles.length || !panFile) {
      return toast({
        title: 'Missing Files',
        description: 'Please upload Aadhaar and PAN.',
        variant: 'destructive',
      });
    }

    try {
      setLoading(true);

      const formData = new FormData();
      aadhaarFiles.forEach((f) => formData.append('aadhaar', f));
      formData.append('pan', panFile);

      const server = await uploadTutorKyc(formData);

      dispatch(
        setTutorKyc({
          kycStatus: mapStatus(server?.kycStatus),
          aadhaarUrls: server?.aadhaarUrls || [],
          panUrl: server?.panUrl || null
        })
      );

      toast({
        title: 'KYC Submitted',
        description: 'Your documents are under review.',
      });
      setAllowEditing(false);
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

  // Render backend images
  const renderImages = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
    </div>
  );

  const isLocked = ['submitted', 'under_review', 'approved'].includes(kycStatus) && !allowEditing;

  // Render inputs
  const renderUploadInputs = () => {
    const aadhaarSources =
      aadhaarPreviewUrls.length > 0
        ? aadhaarPreviewUrls
        : (aadhaarUrls || []).map((src) => getImageUrl(src));
    const panSource = panPreviewUrl || (panUrl ? getImageUrl(panUrl) : null);

    return (
      <>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Aadhaar (front/back)</div>
                <div className="text-xs text-muted-foreground">JPG or PNG only</div>
              </div>
              {aadhaarFiles.length > 0 && (
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {aadhaarFiles.length} selected
                </Badge>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              {aadhaarSources.length > 0 ? (
                aadhaarSources.slice(0, 2).map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`aadhaar-${index}`}
                    className="h-28 w-full rounded-xl object-cover border"
                  />
                ))
              ) : (
                <div className="col-span-2 flex h-28 items-center justify-center rounded-xl border border-dashed text-xs text-slate-500">
                  No Aadhaar uploaded yet
                </div>
              )}
            </div>

            {!isLocked && (
              <Input
                className="mt-3 bg-white"
                type="file"
                multiple
                accept="image/*"
                onChange={handleAadhaarChange}
              />
            )}
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">PAN Card</div>
                <div className="text-xs text-muted-foreground">JPG or PNG only</div>
              </div>
              {panFile && (
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  Selected
                </Badge>
              )}
            </div>

            <div className="mt-3">
              {panSource ? (
                <img
                  src={panSource}
                  alt="pan"
                  className="h-28 w-full rounded-xl object-cover border"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-xl border border-dashed text-xs text-slate-500">
                  No PAN uploaded yet
                </div>
              )}
            </div>

            {!isLocked && (
              <Input
                className="mt-3 bg-white"
                type="file"
                accept="image/*"
                onChange={handlePanChange}
              />
            )}
          </div>
        </div>

        {!isLocked && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button disabled={loading} onClick={handleSubmit}>
              <Upload className="w-4 h-4 mr-2" />
              {loading ? 'Uploading...' : 'Submit for Review'}
            </Button>
            <div className="text-xs text-muted-foreground self-center">
              Your documents are encrypted and reviewed by our team.
            </div>
          </div>
        )}
      </>
    );
  };

  const renderReadOnlyNotice = () => (
    isLocked ? (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="text-sm text-slate-700">
        Documents are locked while under review. Use Replace to resubmit.
      </div>
      <Button variant="outline" onClick={() => setAllowEditing(true)}>
        Replace Documents
      </Button>
    </div>
    ) : null
  );

  // Badge color
  const getStatusBadgeClass = () => {
    switch (kycStatus) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'under_review':
        return 'bg-blue-100 text-blue-700';
      case 'submitted':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_90%_-10%,rgba(250,204,21,0.18),transparent),radial-gradient(900px_400px_at_-10%_0%,rgba(37,99,235,0.08),transparent)]">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar title="Verification" subtitle="Upload your KYC documents" />

        <main className="p-4 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card className="p-6 lg:p-8 rounded-3xl bg-white/90 backdrop-blur border shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>

                  <div>
                    <div className="text-lg font-semibold">Verification Center</div>
                    <div className="text-sm text-muted-foreground">
                      Upload Aadhaar and PAN to complete verification.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">Current status</div>
                  <Badge className={`capitalize ${getStatusBadgeClass()}`}>
                    {kycStatus === 'approved' ? 'verified' : kycStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 grid lg:grid-cols-[1.2fr_1fr] gap-6">
                <div className="rounded-2xl border bg-white p-5">
                  <div className="text-sm font-semibold">Steps</div>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">1</div>
                      Upload Aadhaar.
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold">2</div>
                      Upload your PAN card.
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">3</div>
                      Submit for review (24-48 hrs).
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-white p-5">
                  <div className="text-sm font-semibold">Tips for faster approval</div>
                  <ul className="mt-3 text-sm text-slate-600 space-y-2 list-disc list-inside">
                    <li>Use clear, high-resolution images.</li>
                    <li>Make sure names match your profile.</li>
                    <li>Avoid cropped or blurry documents.</li>
                  </ul>
                </div>
              </div>

              {kycStatus === 'approved' ? (
                <>
                  <p className="font-medium mt-6 mb-3 text-emerald-700">
                    Your KYC is verified.
                  </p>
                  {renderUploadInputs()}
                  {renderReadOnlyNotice()}
                </>
              ) : kycStatus === 'under_review' ? (
                <>
                  <p className="font-medium mt-6 mb-3 text-blue-700">
                    Your KYC is under review.
                  </p>
                  {renderUploadInputs()}
                  {renderReadOnlyNotice()}
                </>
              ) : kycStatus === 'rejected' ? (
                <>
                  <p className="font-medium mt-6 mb-3 text-red-600">
                    Your KYC was rejected. Please upload again.
                  </p>
                  {renderUploadInputs()}
                </>
              ) : kycStatus === 'submitted' ? (
                <>
                  <p className="font-medium mt-6 mb-3 text-amber-700">
                    Your KYC is submitted and pending review.
                  </p>
                  {renderUploadInputs()}
                  {renderReadOnlyNotice()}
                </>
              ) : (
                renderUploadInputs()
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
