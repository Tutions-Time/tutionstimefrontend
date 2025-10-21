'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { OTPInput } from '@/components/auth/OTPInput';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOTP] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [requestId, setRequestId] = useState('');

  const { sendOtp, login, isLoading, error, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (isAuthenticated && user) {
      const rolePath = `/dashboard/${user.role}`;
      router.replace(rolePath);
    }
  }, [isAuthenticated, user, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    console.log("handle send otp")
    e.preventDefault();
    
    try {
      const response = await sendOtp(phone, 'login');
      if (response.requestId) {
        setRequestId(response.requestId);
        setStep('otp');
        setCountdown(response.expiresIn || 30);
        toast({
          title: 'OTP Sent',
          description: 'Please check your phone for the verification code',
          variant: 'default',
        });
      } else {
        throw new Error('Failed to get request ID');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to send OTP',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyOTP = async (otpValue: string) => {
    try {
      const result = await login(phone, otpValue, requestId);
      
      // Show success toast
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
        variant: 'default',
      });
      
      // Let the useAuth hook handle redirection based on profile status
      
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      const result = await sendOtp(phone, 'login');
      setRequestId(result.requestId);
      setCountdown(30);
      toast({
        title: 'OTP Resent',
        description: 'Please check your phone for the new verification code',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to resend OTP',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
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
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
              T
            </div>
            <span className="font-bold text-2xl text-text">Tuitions time</span>
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">Welcome Back</h1>
          <p className="text-muted">
            {step === 'phone'
              ? 'Enter your mobile number to get started'
              : 'Enter the 6-digit code sent to your phone'}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter mobile number"
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
              disabled={isLoading || phone.length !== 10}
            >
              {isLoading ? 'Sending OTP...' : 'Sign In'}
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
              <div className="text-sm text-red-500 text-center mt-2">
                {error}
              </div>
            )}


            <p className="text-center text-sm text-muted mt-6">
              Don&apos;t have an account?{' '}
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
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
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
                  disabled={isLoading}
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
