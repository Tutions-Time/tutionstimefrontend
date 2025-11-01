'use client';

import { useEffect, useState, ChangeEvent } from 'react';
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

export default function TutorKycPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState<'pending' | 'submitted' | 'approved' | 'rejected'>('pending');
  const [aadhaarFiles, setAadhaarFiles] = useState<File[]>([]);
  const [aadhaarPreviews, setAadhaarPreviews] = useState<string[]>([]);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [bankPreview, setBankPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🧠 Fetch KYC status and existing files on mount
  useEffect(() => {
    const fetchKycData = async () => {
      try {
        const profile = await getTutorProfile();
        if (profile?.kycStatus) setStatus(profile.kycStatus);
        if (profile?.aadhaarUrls?.length) setAadhaarPreviews(profile.aadhaarUrls);
        if (profile?.panUrl) setPanPreview(profile.panUrl);
        if (profile?.bankProofUrl) setBankPreview(profile.bankProofUrl);
      } catch (error: any) {
        console.error('Failed to load KYC info:', error.message);
      }
    };
    fetchKycData();
  }, []);

  const handleAadhaarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAadhaarFiles(files);
    setAadhaarPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPanFile(file);
    setPanPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBankChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBankFile(file);
    setBankPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async () => {
    if (!aadhaarFiles.length || !panFile || !bankFile) {
      toast({
        title: 'Missing files',
        description: 'Please upload all required documents.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      aadhaarFiles.forEach((f) => formData.append('aadhaar', f));
      formData.append('pan', panFile);
      formData.append('bankProof', bankFile);

      const res = await uploadTutorKyc(formData);
      setStatus('submitted');
      toast({
        title: 'KYC Submitted',
        description: 'Your KYC documents have been submitted for review.',
      });
      console.log('KYC Upload Response:', res);
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
    switch (status) {
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
              <Badge className={`capitalize ${getStatusBadgeClass()}`}>{status}</Badge>
            </div>

            {/* If already verified, show message */}
            {status === 'approved' ? (
              <div className="mt-6 text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold text-lg">✅ Your KYC is already verified.</p>
              </div>
            ) : (
              <>
                {/* File Inputs + Previews */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  {/* Aadhaar */}
                  <div>
                    <label className="text-sm font-medium">Aadhaar (front/back)</label>
                    <Input type="file" multiple onChange={handleAadhaarChange} />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {aadhaarPreviews.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`Aadhaar-${i}`}
                          className="w-24 h-16 rounded object-cover border"
                        />
                      ))}
                    </div>
                  </div>

                  {/* PAN */}
                  <div>
                    <label className="text-sm font-medium">PAN Card</label>
                    <Input type="file" onChange={handlePanChange} />
                    {panPreview && (
                      <img
                        src={panPreview}
                        alt="PAN"
                        className="w-24 h-16 rounded mt-2 object-cover border"
                      />
                    )}
                  </div>

                  {/* Bank Proof */}
                  <div>
                    <label className="text-sm font-medium">Bank Proof (Passbook/Cheque)</label>
                    <Input type="file" onChange={handleBankChange} />
                    {bankPreview && (
                      <img
                        src={bankPreview}
                        alt="Bank Proof"
                        className="w-24 h-16 rounded mt-2 object-cover border"
                      />
                    )}
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
