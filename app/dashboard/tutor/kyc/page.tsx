'use client';

import {
  useEffect,
  useState,
  ChangeEvent,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setTutorKyc } from '@/store/slices/tutorKycSlice';

import {
  ShieldCheck,
  Upload,
  Loader2,
  CloudUpload,
  AlertTriangle,
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { uploadTutorKyc, getTutorProfile } from '@/services/tutorService';

// ✅ Helper: normalize image URL (S3 + local)
const getProperImageUrl = (path?: string | null) => {
  if (!path) return '';
  const p = String(path);
  if (p.startsWith('http://') || p.startsWith('https://')) return p;

  const cleaned = p
    .replace(/^[A-Za-z]:\\.*?uploads\\/i, 'uploads/')
    .replace(/\\/g, '/');

  const base =
    (process.env.NEXT_PUBLIC_IMAGE_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
      'http://127.0.0.1:5000').replace(/\/$/, '');

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
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  const [isAadhaarDragging, setIsAadhaarDragging] = useState(false);
  const [isPanDragging, setIsPanDragging] = useState(false);

  const aadhaarInputRef = useRef<HTMLInputElement | null>(null);
  const panInputRef = useRef<HTMLInputElement | null>(null);

  // 🔁 Load profile on mount
  useEffect(() => {
    (async () => {
      try {
        const profile = await getTutorProfile();
        dispatch(
          setTutorKyc({
            kycStatus: profile?.kycStatus || 'pending',
            aadhaarUrls: profile?.aadhaarUrls || [],
            panUrl: profile?.panUrl || null,
          })
        );
      } catch (error) {
        console.error('Failed to load KYC info:', error);
      }
    })();
  }, [dispatch]);

  // If no docs at all → start in edit mode
  useEffect(() => {
    const hasDocs =
      (Array.isArray(aadhaarUrls) && aadhaarUrls.length > 0) || !!panUrl;
    if (!hasDocs) {
      setEditMode(true);
    }
  }, [aadhaarUrls, panUrl]);

  // 📂 Input handlers
  const handleAadhaarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAadhaarFiles(files);
  };

  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPanFile(file);
  };

  // 🧲 Drag & Drop handlers
  const handleAadhaarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsAadhaarDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length) {
      setAadhaarFiles(files);
    }
  };

  const handlePanDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPanDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files[0]) {
      setPanFile(files[0]);
    }
  };

  // ✅ Submit handler
  const handleSubmit = async () => {
    const hasExistingAadhaar =
      Array.isArray(aadhaarUrls) && aadhaarUrls.length > 0;
    const hasExistingPan = !!panUrl;

    const hasNewAadhaar = aadhaarFiles.length > 0;
    const hasNewPan = !!panFile;

    // Allow changing only one doc: but each side must have something (existing or new)
    if (!(hasExistingAadhaar || hasNewAadhaar)) {
      return toast({
        title: 'Aadhaar required',
        description: 'Upload Aadhaar (front & back) to continue.',
        variant: 'destructive',
      });
    }

    if (!(hasExistingPan || hasNewPan)) {
      return toast({
        title: 'PAN required',
        description: 'Upload a PAN Card to continue.',
        variant: 'destructive',
      });
    }

    if (!hasNewAadhaar && !hasNewPan) {
      return toast({
        title: 'No changes',
        description: 'You have not selected any new documents to upload.',
        variant: 'destructive',
      });
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Only send changed files
      if (hasNewAadhaar) {
        aadhaarFiles.forEach((f) => formData.append('aadhaar', f));
      }
      if (hasNewPan && panFile) {
        formData.append('pan', panFile);
      }

      const data = await uploadTutorKyc(formData);

      dispatch(
        setTutorKyc({
          kycStatus: data?.kycStatus || 'submitted',
          aadhaarUrls: data?.aadhaarUrls || aadhaarUrls || [],
          panUrl: data?.panUrl || panUrl || null,
        })
      );

      setAadhaarFiles([]);
      setPanFile(null);
      setEditMode(false);
      setShowReplaceConfirm(false);

      toast({
        title: 'KYC submitted',
        description: 'Your documents have been uploaded for review.',
      });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.message || 'Unable to upload KYC right now.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🎫 Status badge theme
  const badgeTheme =
    {
      approved: 'bg-green-100 text-green-700 border border-green-200',
      rejected: 'bg-red-100 text-red-700 border border-red-200',
      submitted: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      pending: 'bg-gray-100 text-gray-700 border border-gray-200',
    }[kycStatus || 'pending'] || 'bg-gray-100 text-gray-700 border';

  const handleClickReplace = () => {
    const hasDocs =
      (Array.isArray(aadhaarUrls) && aadhaarUrls.length > 0) || !!panUrl;

    // If nothing exists yet, go directly to edit mode
    if (!hasDocs) {
      setEditMode(true);
      return;
    }

    // Show confirmation bar instead of jumping straight to edit mode
    setShowReplaceConfirm(true);
  };

  const handleConfirmReplace = () => {
    setAadhaarFiles([]);
    setPanFile(null);
    setEditMode(true);
    setShowReplaceConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        <Topbar
          title="Tutor Verification"
          subtitle="Aadhaar and PAN verification"
        />

        <main className="p-4 lg:p-8">
          <Card className="max-w-5xl mx-auto p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                    KYC Verification
                  </h2>
                  <p className="text-sm text-gray-500">
                    Submit and manage your identification documents
                  </p>
                </div>
              </div>

              <Badge className={`capitalize px-4 py-1 text-sm ${badgeTheme}`}>
                {kycStatus || 'pending'}
              </Badge>
            </div>

            {/* Small tips row */}
            <div className="mt-4 grid md:grid-cols-3 gap-4 text-xs text-gray-500">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="font-medium text-gray-700 mb-1">
                  Requirements
                </div>
                Upload clear photos or scans of Aadhaar (front & back) and your
                PAN Card.
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="font-medium text-gray-700 mb-1">
                  Allowed formats
                </div>
                JPG / PNG up to 5MB per file.
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="font-medium text-gray-700 mb-1">
                  Review time
                </div>
                Typically reviewed within 24–48 hours by our team.
              </div>
            </div>

            {/* Current documents */}
            {((Array.isArray(aadhaarUrls) && aadhaarUrls.length > 0) ||
              panUrl) && (
              <section className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800">
                    Current documents
                  </h3>
                  {!editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClickReplace}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Replace documents
                    </Button>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  {aadhaarUrls?.map((src, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden shadow-sm"
                    >
                      <img
                        src={getProperImageUrl(src)}
                        alt={`Aadhaar ${i + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <div className="px-3 py-2 text-xs text-gray-600 text-center">
                        Aadhaar {i + 1}
                      </div>
                    </div>
                  ))}

                  {panUrl && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden shadow-sm">
                      <img
                        src={getProperImageUrl(panUrl)}
                        alt="PAN"
                        className="w-full h-40 object-cover"
                      />
                      <div className="px-3 py-2 text-xs text-gray-600 text-center">
                        PAN Card
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Confirmation bar for Replace */}
            {showReplaceConfirm && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-amber-900">
                    Replace current KYC documents?
                  </div>
                  <p className="text-xs text-amber-800 mt-1">
                    Your existing Aadhaar and PAN images will be replaced once
                    you submit new documents.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={handleConfirmReplace}
                    >
                      Continue &amp; upload new docs
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowReplaceConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload section (drag & drop) */}
            {editMode && (
              <section className="mt-8">
                <h3 className="font-medium text-gray-800 mb-4">
                  Upload new documents
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Aadhaar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">
                        Aadhaar (Front &amp; Back)
                      </span>
                      <span className="text-[11px] uppercase tracking-wide text-gray-500">
                        REQUIRED
                      </span>
                    </div>

                    <div
                      className={`mt-2 rounded-2xl border-2 border-dashed px-4 py-6 bg-gray-50 cursor-pointer transition ${
                        isAadhaarDragging
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/40'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsAadhaarDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsAadhaarDragging(false);
                      }}
                      onDrop={handleAadhaarDrop}
                      onClick={() => aadhaarInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <CloudUpload className="w-8 h-8 text-yellow-500" />
                        <div className="text-sm font-medium text-gray-800">
                          Drag &amp; drop files here
                        </div>
                        <div className="text-xs text-gray-500">
                          or <span className="font-semibold">browse</span> from
                          device
                        </div>
                        <div className="mt-2 text-[11px] text-gray-400">
                          Accepts JPG / PNG • Up to 5MB each
                        </div>
                      </div>
                      <Input
                        ref={aadhaarInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAadhaarChange}
                      />
                    </div>

                    {aadhaarFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {aadhaarFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Aadhaar preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PAN */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">
                        PAN Card
                      </span>
                      <span className="text-[11px] uppercase tracking-wide text-gray-500">
                        REQUIRED
                      </span>
                    </div>

                    <div
                      className={`mt-2 rounded-2xl border-2 border-dashed px-4 py-6 bg-gray-50 cursor-pointer transition ${
                        isPanDragging
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/40'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsPanDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsPanDragging(false);
                      }}
                      onDrop={handlePanDrop}
                      onClick={() => panInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <CloudUpload className="w-8 h-8 text-yellow-500" />
                        <div className="text-sm font-medium text-gray-800">
                          Drag &amp; drop file here
                        </div>
                        <div className="text-xs text-gray-500">
                          or <span className="font-semibold">browse</span> from
                          device
                        </div>
                        <div className="mt-2 text-[11px] text-gray-400">
                          Accepts JPG / PNG • Up to 5MB
                        </div>
                      </div>
                      <Input
                        ref={panInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePanChange}
                      />
                    </div>

                    {panFile && (
                      <div className="mt-3 w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                        <img
                          src={URL.createObjectURL(panFile)}
                          alt="PAN preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit for review
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    disabled={loading}
                    onClick={() => {
                      setEditMode(false);
                      setAadhaarFiles([]);
                      setPanFile(null);
                      setShowReplaceConfirm(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </section>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
