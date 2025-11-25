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

// ✅ Helper for building correct image URLs (handles S3 + local uploads)
const getProperImageUrl = (path?: string | null) => {
  if (!path) return '';
  const p = String(path);
  // If already an absolute URL (S3), return as is
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  // Normalize windows-style paths
  const cleaned = p
    .replace(/^[A-Za-z]:\\.*?uploads\\/i, 'uploads/')
    .replace(/\\/g, '/');
  const base =
    (process.env.NEXT_PUBLIC_IMAGE_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000')
      .replace(/\/$/, '');
  const rel = cleaned.replace(/^\//, '');
  return `${base}/${rel}`;
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
  const [editMode, setEditMode] = useState(false);

  // 🧠 Fetch KYC data on mount
  useEffect(() => {
    const fetchKycData = async () => {
      try {
        const profile = await getTutorProfile();
        dispatch(
          setTutorKyc({
            kycStatus: profile?.kycStatus || 'pending',
            aadhaarUrls: profile?.aadhaarUrls || [],
            panUrl: profile?.panUrl || null,
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

  // 🧩 Submit handler
  const handleSubmit = async () => {
    if (!aadhaarFiles.length || !panFile) {
      return toast({
        title: 'Missing files',
        description: 'Please upload Aadhaar (front/back) and PAN.',
        variant: 'destructive',
      });
    }

    try {
      setLoading(true);
      const formData = new FormData();
      aadhaarFiles.forEach((f) => formData.append('aadhaar', f));
      formData.append('pan', panFile);
      const data = await uploadTutorKyc(formData);

      // ✅ Update Redux
      dispatch(
        setTutorKyc({
          kycStatus: data?.kycStatus || 'submitted',
          aadhaarUrls: data?.aadhaarUrls || [],
          panUrl: data?.panUrl || null,
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
                  <div className="text-sm text-muted">Aadhaar / PAN</div>
                </div>
              </div>
              <Badge className={`capitalize ${getStatusBadgeClass()}`}>{kycStatus}</Badge>
            </div>

            {/* ✅ Display existing KYC images */}
            {(!editMode) && (kycStatus === 'approved' || kycStatus === 'submitted') ? (
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
                        src={getProperImageUrl(src)}
                        alt={`aadhaar-${i}`}
                        className="w-32 h-24 rounded object-cover border"
                      />
                    ))}

                  {panUrl && (
                    <img
                      src={getProperImageUrl(panUrl)}
                      alt="PAN"
                      className="w-32 h-24 rounded object-cover border"
                    />
                  )}
                </div>
                <div className="mt-6">
                  <Button variant="outline" onClick={() => setEditMode(true)}>Replace Documents</Button>
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
                </div>

                <div className="mt-6 flex gap-2">
                  <Button variant="outline" disabled={loading} onClick={handleSubmit}>
                    <Upload className="w-4 h-4 mr-2" />
                    {loading ? 'Uploading...' : 'Submit for Review'}
                  </Button>
                  {editMode && (
                    <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
