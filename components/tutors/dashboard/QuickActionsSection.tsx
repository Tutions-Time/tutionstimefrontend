"use client";

import Link from "next/link";
import { Video, Wallet, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickActionsSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-text">Quick Actions</h2>

      {/* Schedule a class */}
      <Card className="p-5 sm:p-6 rounded-2xl shadow-soft bg-gradient-to-br from-primary/10 to-primaryWeak hover:shadow-lg transition-base">
        <Video className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
        <h3 className="font-semibold text-text mb-1 sm:mb-2">
          Schedule a Class
        </h3>
        <p className="text-sm text-muted mb-3 sm:mb-4">
          Plan your next session with your students
        </p>
        <Link href="/dashboard/tutor/classes">
          <Button className="w-full bg-primary hover:bg-primary/90 text-text">
            Schedule Now
          </Button>
        </Link>
      </Card>

      {/* Wallet */}
      <Card className="p-5 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
        <h3 className="font-semibold text-text mb-1 sm:mb-2">
          Withdraw Earnings
        </h3>
        <p className="text-sm text-muted mb-3 sm:mb-4">
          Check your wallet and request withdrawal
        </p>
        <Link href="/wallet">
          <Button variant="outline" className="w-full">
            Go to Wallet
          </Button>
        </Link>
      </Card>

      {/* KYC */}
      <Card className="p-5 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-success mb-3 sm:mb-4" />
        <h3 className="font-semibold text-text mb-1 sm:mb-2">
          Verify KYC
        </h3>
        <p className="text-sm text-muted mb-3 sm:mb-4">
          Complete your verification to get more bookings
        </p>
        <Link href="/dashboard/tutor/kyc">
          <Button variant="outline" className="w-full">
            Start Verification
          </Button>
        </Link>
      </Card>
    </section>
  );
}
