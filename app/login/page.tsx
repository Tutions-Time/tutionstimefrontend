"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { OTPInput } from "@/components/auth/OTPInput";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOTP] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [requestId, setRequestId] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { sendOtp, login, isAuthenticated, user, error } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSendingOtp(true);
      const response = await sendOtp(email, "login");
      setRequestId(response.requestId);
      setStep("otp");
      setCountdown(response.expiresIn || 30);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });
    } catch (err: any) {
      toast({
        title: "Failed to send OTP",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (otpValue: string) => {
    if (verifyingOtp) return;
    try {
      setVerifyingOtp(true);
      await login(email, otpValue, requestId);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      setSendingOtp(true);
      const res = await sendOtp(email, "login");
      setRequestId(res.requestId);
      setCountdown(30);
      toast({
        title: "OTP Resent",
        description: "Please check your email for the new code",
      });
    } catch (err: any) {
      toast({
        title: "Failed to resend OTP",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
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
          {/* ✅ LOGO – format preserved */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 flex items-center">
              <Image
                src="/images/logo.png"
                alt="Tuitions Time"
                width={160}
                height={22}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-text mb-2">
            Welcome Back
          </h1>

          <p className="text-muted">
            {step === "email"
              ? "Enter your email to get started"
              : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
              disabled={sendingOtp || !email.includes("@")}
            >
              {sendingOtp ? "Sending OTP..." : "Sign In"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted">Or</span>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            <p className="text-center text-sm text-muted mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <OTPInput
              value={otp}
              onChange={setOTP}
              onComplete={handleVerifyOTP}
              length={6}
            />

            <Button
              onClick={() => handleVerifyOTP(otp)}
              disabled={verifyingOtp || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
            >
              {verifyingOtp ? "Verifying..." : "Verify Code"}
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
                  onClick={handleResendOTP}
                >
                  Resend Code
                </button>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}

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
