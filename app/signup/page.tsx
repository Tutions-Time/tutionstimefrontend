'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { OTPInput } from '@/components/auth/OTPInput';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as 'student' | 'tutor' | null;

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'role' | 'email' | 'otp'>('role');
  const [role, setRole] = useState<'student' | 'tutor' | null>(initialRole);
  const [otp, setOTP] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [requestId, setRequestId] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [createdRole, setCreatedRole] = useState<'student' | 'tutor' | null>(null);

  const { sendOtp, signup, isLoading, error } = useAuth();
  const { toast } = useToast();

  const handleRoleSelect = (selectedRole: 'student' | 'tutor') => {
    setRole(selectedRole);
    setStep('email');
  };

  const resetSignupForm = () => {
    setEmail('');
    setOTP('');
    setRequestId('');
    setReferralCode('');
    setStep('role');
    setCountdown(0);
    setSendingOtp(false);
    setVerifyingOtp(false);
    setRole(initialRole);
  };

  const handleCompleteProfile = () => {
    if (!createdRole) return;
    router.push(`/dashboard/${createdRole}/profile/complete`);
  };

  const handleStartNewSignup = () => {
    resetSignupForm();
    setAccountCreated(false);
    setCreatedRole(null);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

    if (!isValidEmail(normalizedEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingOtp(true);
      const response = await sendOtp(normalizedEmail, 'signup');
      console.log('OTP Response:', response); // Debug log
      
      if (response.requestId) {
        console.log('Setting requestId:', response.requestId); // Debug log
        setRequestId(response.requestId);
        setStep('otp');
        setCountdown(response.expiresIn || 30);
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the verification code',
          variant: 'default',
        });
      } else {
        throw new Error('No request ID received from server');
      }
    } catch (error: any) {
      console.error('OTP Send Error:', error); 
      toast({
        title: 'Failed to send OTP',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (otpValue: string) => {

    console.log('Verifying OTP with:', { email, otpValue, requestId, role }); // Debug log
    
    if (!role || !requestId || !email) {
      console.log('Missing required fields:', { role, requestId, email }); // Debug log
      toast({
        title: 'Missing Information',
        description: 'Please provide all required information',
        variant: 'destructive',
      });
      return;
    }

    if (verifyingOtp) return;

    try {
      setVerifyingOtp(true);
      await signup(
        email.trim(),
        otpValue.trim(),
        requestId,
        role,
        role === 'student' ? referralCode.trim() || undefined : undefined
      );
      toast({
        title: 'Signup Successful',
        description: 'Your account has been created successfully',
        variant: 'default',
      });
      setCreatedRole(role);
      setAccountCreated(true);
      setCountdown(0);
    } catch (error: any) {
      console.error('Verification Error:', error); // Debug log
      toast({
        title: 'Verification Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-soft">
        {/* 🔙 Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text mb-6 transition-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* 🏷️ Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
              T
            </div>
            <span className="font-bold text-2xl text-text">Tuitionstime</span>
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">
            {step === 'role' ? 'Get Started' : 'Create Account'}
          </h1>
          <p className="text-muted">
            {step === 'role'
              ? 'Choose your account type'
              : step === 'email'
                ? 'Enter your email to continue'
                : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {accountCreated && createdRole ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold text-base text-emerald-900">
                Account created successfully
              </p>
              <p className="text-sm text-emerald-900/80">
                Your {createdRole === 'student' ? 'student' : 'tutor'} account is ready.
                Complete your profile to unlock the dashboard or start a fresh signup.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleCompleteProfile}
                className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
              >
                Continue to profile completion
              </Button>
              <Button
                variant="outline"
                onClick={handleStartNewSignup}
                className="w-full text-primary font-semibold"
              >
                Sign up with another email
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* 🧩 Step 1: Choose Role */}
            {step === 'role' && (
              <div className="space-y-6">
                <RoleSelector value={role} onChange={handleRoleSelect} />
                <p className="text-center text-sm text-muted mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            )}

            {/* 📱 Step 2: Enter Mobile Number */}
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
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

                {role === 'student' ? (
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
                ) : (
                  <>
                    {/* Referral field hidden for tutor signup */}
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
                  disabled={sendingOtp}
                >
                  {sendingOtp ? 'Sending OTP...' : 'Continue'}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="w-full text-sm text-muted hover:text-text transition-base"
                >
                  Choose a different role
                </button>
              </form>
            )}

            {/* 🔢 Step 3: OTP Verification */}
            {step === 'otp' && (
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
                  {verifyingOtp ? 'Verifying...' : 'Verify & Create Account'}
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
                      {sendingOtp ? 'Sending...' : 'Resend Code'}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-sm text-muted hover:text-text transition-base"
                >
                  Use a different email
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
