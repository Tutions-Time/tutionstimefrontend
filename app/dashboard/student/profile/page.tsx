"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setBulk } from "@/store/slices/studentProfileSlice";
import {
  getUserProfile,
  updateStudentProfile,
  updateStudentPayoutDetails,
} from "@/services/profileService";

import { validateStudentProfileFields } from "@/utils/validators";

// Sections
import HeaderSection from "@/components/CompleteProfile/HeaderSection";
import PersonalInfoSection from "@/components/CompleteProfile/PersonalInfoSection";
import AcademicDetailsSection from "@/components/CompleteProfile/AcademicDetailsSection";
import PreferredSubjectsSection from "@/components/CompleteProfile/PreferredSubjectsSection";
import TutorPreferencesSection from "@/components/CompleteProfile/TutorPreferencesSection";
import PaymentPreferenceSection from "@/components/CompleteProfile/PaymentPreferenceSection";

export default function StudentProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const [referralCode, setReferralCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    upiId: "",
    accountHolderName: "",
    bankAccountNumber: "",
    ifsc: "",
  });
  const router = useRouter();

  const payoutDetailsMissing =
    isProfileComplete &&
    (!profile.upiId ||
      !profile.accountHolderName ||
      !profile.bankAccountNumber ||
      !profile.ifsc);

  // -------- Fetch Profile --------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res.success && res.data.profile) {
          dispatch(setBulk(res.data.profile));
          setReferralCode(res.data?.referralCode || "");
          setIsProfileComplete(Boolean(res?.data?.user?.isProfileComplete));
          const student = res.data.profile;
          setPayoutForm({
            upiId: String(student?.upiId || ""),
            accountHolderName: String(student?.accountHolderName || ""),
            bankAccountNumber: String(student?.bankAccountNumber || ""),
            ifsc: String(student?.ifsc || ""),
          });
          if (
            Boolean(res?.data?.user?.isProfileComplete) &&
            (!student?.upiId ||
              !student?.accountHolderName ||
              !student?.bankAccountNumber ||
              !student?.ifsc)
          ) {
            setShowPayoutModal(true);
          }
        } else toast({
            title: "Profile not found",
            variant: "destructive",
          });
      } catch {
        toast({
          title: "Error loading profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (payoutDetailsMissing) {
      setShowPayoutModal(true);
    }
  }, [payoutDetailsMissing]);

  // -------- Save Handler --------
  const handleSave = async () => {
    const validation = validateStudentProfileFields(profile);

    if (Object.keys(validation).length > 0) {
      const messages = Object.values(validation).filter(Boolean);
      toast({
        title: "Validation error",
        description: messages.join("\n"),
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      Object.entries(profile || {}).forEach(([k, v]) => {
        if (k === "addressLine2") return;
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else if (v !== undefined && v !== null) fd.append(k, v);
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await updateStudentProfile(fd);
      if (res.success) {
        toast({
          title: "Profile updated successfully",
        });
        setEditMode(false);
        router.push("/dashboard/student");
      } else toast({
          title: "Update failed",
          description: res.message || "Update failed",
          variant: "destructive",
        });
    } catch (err: any) {
      toast({
        title: "Error saving profile",
        description: err.message || "Error saving profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayoutDetails = async () => {
    const upiId = payoutForm.upiId.trim();
    const accountHolderName = payoutForm.accountHolderName.trim();
    const bankAccountNumber = payoutForm.bankAccountNumber.trim();
    const ifsc = payoutForm.ifsc.trim().toUpperCase();

    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const bankRegex = /^[0-9]{9,18}$/;

    if (!upiRegex.test(upiId)) {
      toast({
        title: "Invalid UPI ID",
        description: "Enter a valid UPI ID",
        variant: "destructive",
      });
      return;
    }
    if (!accountHolderName) {
      toast({
        title: "Account holder name required",
        variant: "destructive",
      });
      return;
    }
    if (!bankRegex.test(bankAccountNumber)) {
      toast({
        title: "Invalid bank account number",
        variant: "destructive",
      });
      return;
    }
    if (!ifscRegex.test(ifsc)) {
      toast({
        title: "Invalid IFSC",
        variant: "destructive",
      });
      return;
    }

    try {
      setPayoutSaving(true);
      const res = await updateStudentPayoutDetails({
        upiId,
        accountHolderName,
        bankAccountNumber,
        ifsc,
      });
      if (!res?.success) {
        throw new Error(res?.message || "Failed to save payout details");
      }
      dispatch(
        setBulk({
          upiId,
          accountHolderName,
          bankAccountNumber,
          ifsc,
        })
      );
      setShowPayoutModal(false);
      toast({ title: "Payout details saved" });
    } catch (err: any) {
      toast({
        title: "Failed to save payout details",
        description: err?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setPayoutSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(35,165,213,0.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(0,0,0,0.06),transparent)]">
      <HeaderSection/>

      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center h-16 px-6">
          <h1 className="text-xl md:text-2xl font-semibold">Student Profile</h1>

          <div className="flex items-center gap-3">
            {!editMode ? (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setEditMode(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="rounded-2xl bg-white shadow-sm p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Your Referral Code</div>
              <div className="text-2xl font-bold">{referralCode }</div>
            </div>
            <button
              className="px-4 py-2 rounded-full border bg-gray-50 hover:bg-gray-100"
              onClick={() => referralCode && navigator.clipboard.writeText(referralCode)}
            >
              Copy
            </button>
          </div>
        </div>

        <form className="max-w-5xl mx-auto px-4 py-10 space-y-10">

          {/* PERSONAL INFO */}
          <PersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            disabled={!editMode}
          />

          <AcademicDetailsSection disabled={!editMode} />

          <PreferredSubjectsSection disabled={!editMode} />

          <PaymentPreferenceSection disabled={!editMode} />

          <TutorPreferencesSection disabled={!editMode} />

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Payout & Refund Details</h3>
              {isProfileComplete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutModal(true)}
                >
                  Edit Details
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              These details are used for student refund settlements.
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-gray-500">UPI ID</div>
                <div className="font-medium text-gray-900">{profile.upiId || "Not added"}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-gray-500">Account Holder</div>
                <div className="font-medium text-gray-900">
                  {profile.accountHolderName || "Not added"}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-gray-500">Bank Account</div>
                <div className="font-medium text-gray-900">
                  {profile.bankAccountNumber || "Not added"}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-gray-500">IFSC</div>
                <div className="font-medium text-gray-900">{profile.ifsc || "Not added"}</div>
              </div>
            </div>
          </section>

        </form>
      </main>

      {showPayoutModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Payout Details</h2>
            <p className="text-sm text-gray-600">
              Add UPI and bank details to request refunds.
            </p>

            <div className="space-y-3">
              <input
                value={payoutForm.upiId}
                onChange={(e) =>
                  setPayoutForm((prev) => ({ ...prev, upiId: e.target.value }))
                }
                placeholder="UPI ID (example@upi)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={payoutForm.accountHolderName}
                onChange={(e) =>
                  setPayoutForm((prev) => ({
                    ...prev,
                    accountHolderName: e.target.value,
                  }))
                }
                placeholder="Account Holder Name"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={payoutForm.bankAccountNumber}
                onChange={(e) =>
                  setPayoutForm((prev) => ({
                    ...prev,
                    bankAccountNumber: e.target.value,
                  }))
                }
                placeholder="Bank Account Number"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={payoutForm.ifsc}
                onChange={(e) =>
                  setPayoutForm((prev) => ({ ...prev, ifsc: e.target.value.toUpperCase() }))
                }
                placeholder="IFSC (example: HDFC0001234)"
                className="w-full border rounded-lg px-3 py-2 text-sm uppercase"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {!payoutDetailsMissing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutModal(false)}
                  disabled={payoutSaving}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSavePayoutDetails}
                disabled={payoutSaving}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {payoutSaving ? "Saving..." : "Save Details"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


