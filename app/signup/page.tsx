'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Phone, ArrowLeft } from 'lucide-react';
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

  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'role' | 'phone' | 'otp'>('role');
  const [role, setRole] = useState<'student' | 'tutor' | null>(initialRole);
  const [otp, setOTP] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [requestId, setRequestId] = useState('');
  
  const { sendOtp, signup, isLoading, error } = useAuth();
  const { toast } = useToast();

  const handleRoleSelect = (selectedRole: 'student' | 'tutor') => {
    setRole(selectedRole);
    setStep('phone');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim() || phone.length !== 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await sendOtp(phone, 'signup');
      console.log('OTP Response:', response); // Debug log
      
      if (response.requestId) {
        console.log('Setting requestId:', response.requestId); // Debug log
        setRequestId(response.requestId);
        setStep('otp');
        setCountdown(response.expiresIn || 30);
        toast({
          title: 'OTP Sent',
          description: 'Please check your phone for the verification code',
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
    }
  };

  const handleVerifyOTP = async (otpValue: string) => {
    console.log('Verifying OTP with:', { phone, otpValue, requestId, role }); // Debug log
    
    if (!role || !requestId || !phone) {
      console.log('Missing required fields:', { role, requestId, phone }); // Debug log
      toast({
        title: 'Missing Information',
        description: 'Please provide all required information',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Don't trim the requestId as it might contain characters that look like whitespace
      await signup(phone.trim(), otpValue.trim(), requestId, role);
      toast({
        title: 'Signup Successful',
        description: 'Your account has been created successfully',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Verification Error:', error); // Debug log
      toast({
        title: 'Verification Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
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
              : step === 'phone'
              ? 'Enter your mobile number to continue'
              : 'Enter the 6-digit code sent to your phone'}
          </p>
        </div>

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
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
            >
              Continue
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
              disabled={otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
            >
              Verify & Create Account
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
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-sm text-muted hover:text-text transition-base"
            >
              Use a different number
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
