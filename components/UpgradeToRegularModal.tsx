"use client";

import { useState } from "react";
import { startRegularFromDemo } from "@/services/bookingService";
import {
  verifyGenericPayment,
  createSubscriptionOrder,
} from "@/services/razorpayService";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { openRazorpayCheckout } from "@/lib/razorpay";

export default function UpgradeToRegularModal({
  booking,
  onClose,
}: {
  booking: any;
  onClose: () => void;
}) {
  const [billingType, setBillingType] = useState<"hourly" | "monthly">(
    "hourly",
  );
  const [numberOfClasses, setNumberOfClasses] = useState(4);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const hourlyRate = booking?.tutorHourlyRate || 0;
  const monthlyRate = booking?.tutorMonthlyRate || 0;

  const completeUpgradeFlow = () => {
    onClose();
    router.push(`/dashboard/student/demoBookings`);
  };

  const openRazorpay = async (order: any, regularClassId: string) => {
    const paymentResponse = await openRazorpayCheckout(order, {
      description: "Regular Class Payment",
    });

    const verifyRes = await verifyGenericPayment(
      paymentResponse,
      {
        planType: "regular",
        billingType,
        numberOfClasses:
          billingType === "hourly" ? Number(numberOfClasses) : undefined,
        regularClassId,
      },
    );

    const isVerified =
      Boolean(verifyRes?.success) ||
      Boolean(verifyRes?.verified) ||
      Boolean(verifyRes?.data?.success) ||
      Boolean(verifyRes?.data?.verified);

    if (!isVerified) {
      throw new Error(verifyRes?.message || "Verification failed");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await startRegularFromDemo(booking._id, {
        planType: "regular",
        billingType,
        numberOfClasses:
          billingType === "hourly" ? Number(numberOfClasses) : undefined,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      const regularClassId = res?.data?.regularClassId;
      const classes = billingType === "hourly" ? Number(numberOfClasses) : 1;
      const orderRes = await createSubscriptionOrder({
        regularClassId,
        billingType,
        numberOfClasses: classes,
      });

      if (orderRes?.walletPaid) {
        toast.success("Payment successful via wallet");
        completeUpgradeFlow();
        return;
      }

      await openRazorpay(orderRes, regularClassId);
      toast.success("Payment successful!");
      completeUpgradeFlow();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Start Regular Classes</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg border bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-700">Tutor Rates</p>
          <div className="mt-1 space-y-1 text-sm text-gray-800">
            <p>
              <span className="font-semibold">Hourly: </span>Rs.{hourlyRate} per
              class
            </p>
            <p>
              <span className="font-semibold">Monthly: </span>Rs.{monthlyRate} per
              month
            </p>
          </div>
        </div>

        <label className="mt-2 text-sm font-medium">Billing Type</label>
        <select
          className="mt-1 w-full rounded border p-2"
          value={billingType}
          onChange={(e) =>
            setBillingType(e.target.value as "hourly" | "monthly")
          }
        >
          <option value="hourly">Hourly (per class)</option>
          <option value="monthly">Monthly (subscription)</option>
        </select>

        {billingType === "hourly" && (
          <>
            <label className="mt-4 block text-sm font-medium">
              Number of Classes
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded border p-2"
              value={numberOfClasses}
              onChange={(e) => setNumberOfClasses(Number(e.target.value))}
            />
          </>
        )}

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="mt-6 w-full rounded bg-[#FFD54F] px-4 py-2 font-semibold text-black hover:bg-[#f3c942] disabled:opacity-60"
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
}
