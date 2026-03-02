"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { OTPInput } from "@/components/auth/OTPInput";
import { RoleSelector } from "@/components/auth/RoleSelector";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function SignupClient() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") as "student" | "tutor" | null;

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("91");
  const [step, setStep] = useState<"role" | "email" | "otp">("role");
  const [role, setRole] = useState<"student" | "tutor" | null>(initialRole);
  const [otp, setOTP] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [requestId, setRequestId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { sendOtp, signup } = useAuth();
  const { toast } = useToast();

  const handleRoleSelect = (selectedRole: "student" | "tutor") => {
    setRole(selectedRole);
    setStep("email");
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
    const isValidPhone = (value: string) => /^[0-9]{10}$/.test(value);
    const isValidCountryCode = (value: string) => /^[0-9]{1,3}$/.test(value);

    if (!isValidEmail(normalizedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    if (!fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }
    if (!isValidPhone(mobile.trim())) {
      toast({
        title: "Invalid Mobile",
        description: "Please enter a 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }
    if (!isValidCountryCode(countryCode.trim())) {
      toast({
        title: "Invalid Country Code",
        description: "Please enter a valid country code (1-3 digits)",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingOtp(true);
      const response = await sendOtp(normalizedEmail, "signup");
      setRequestId(response.requestId);
      setStep("otp");
      setCountdown(response.expiresIn || 30);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (otpValue: string) => {
    if (!role || !requestId || !email || verifyingOtp) return;

    try {
      setVerifyingOtp(true);
      await signup(
        email.trim(),
        otpValue.trim(),
        requestId,
        role,
        role === "student" ? referralCode.trim() || undefined : undefined,
        fullName.trim(),
        mobile.trim()
      );
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-soft">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text mb-6 transition-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="mb-8">
          {/* ✅ LOGO – SAME FORMAT AS LOGIN */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 flex items-center">
              <Image
                src="/images/logo.png"
                alt="TuitionsTime logo"
                width={160}
                height={22}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-text mb-2">
            {step === "role" ? "Get Started" : "Create Account"}
          </h1>

          <p className="text-muted">
            {step === "role"
              ? "Choose your account type"
              : step === "email"
              ? "Enter your email to continue"
              : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        {step === "role" && (
          <div className="space-y-6">
            <RoleSelector value={role} onChange={handleRoleSelect} />
            <p className="text-center text-sm text-muted mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="relative w-28">
                  <Input
                    id="countryCode"
                    type="tel"
                    placeholder="91"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    className="pl-6"
                    inputMode="numeric"
                    pattern="[0-9]{1,3}"
                    required
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted">+</span>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
            </div>

            

            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="referral">Referral Code (optional)</Label>
                <Input
                  id="referral"
                  type="text"
                  placeholder="Enter referral code if you have one"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
              disabled={sendingOtp}
            >
              {sendingOtp ? "Sending OTP..." : "Continue"}
            </Button>

            <button
              type="button"
              onClick={() => setStep("role")}
              className="w-full text-sm text-muted hover:text-text transition-base"
            >
              Choose a different role
            </button>
          </form>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <OTPInput value={otp} onChange={setOTP} onComplete={handleVerifyOTP} length={6} />

            <Button
              onClick={() => handleVerifyOTP(otp)}
              disabled={verifyingOtp || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
            >
              {verifyingOtp ? "Verifying..." : "Verify & Create Account"}
            </Button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted">
                  Resend code in <span className="font-semibold">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  className="text-sm text-primary font-medium hover:underline"
                  onClick={handleSendOTP}
                  disabled={sendingOtp}
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-muted hover:text-text transition-base"
            >
              Use a different email
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
