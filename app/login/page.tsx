'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { OTPInput } from '@/components/auth/OTPInput';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOTP] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Validate phone format if needed
    setStep('otp');
    setCountdown(30);
  };

  const handleVerifyOTP = (otpValue: string) => {
    console.log('Verifying OTP:', otpValue);
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
              : 'Enter the 4-digit code sent to your phone'}
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
            >
              Sign In
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted">Or</span>
              </div>
            </div>



            <p className="text-center text-sm text-muted mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <OTPInput value={otp} onChange={setOTP} onComplete={handleVerifyOTP} />

            <Button
              onClick={() => handleVerifyOTP(otp)}
              disabled={otp.length !== 4}
              className="w-full bg-primary hover:bg-primary/90 text-text font-semibold"
            >
              Verify Code
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
                  onClick={() => setCountdown(30)}
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
