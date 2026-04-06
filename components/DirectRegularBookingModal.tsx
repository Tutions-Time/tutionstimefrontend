"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { startRegularDirect } from "@/services/bookingService";
import {
  createSubscriptionOrder,
  verifyGenericPayment,
} from "@/services/razorpayService";

export default function DirectRegularBookingModal({
  open,
  onClose,
  tutor,
  tutorId,
}: {
  open: boolean;
  onClose: () => void;
  tutor: any;
  tutorId: string;
}) {
  const router = useRouter();
  const subjects = Array.isArray(tutor?.subjects) ? tutor.subjects : [];
  const [subject, setSubject] = useState(subjects[0] || "");
  const [billingType, setBillingType] = useState<"hourly" | "monthly">(
    "hourly"
  );
  const [numberOfClasses, setNumberOfClasses] = useState(4);
  const [loading, setLoading] = useState(false);

  const hourlyRate = Number(tutor?.hourlyRate || 0);
  const monthlyRate = Number(tutor?.monthlyRate || 0);

  const payable = useMemo(
    () =>
      billingType === "hourly"
        ? hourlyRate * Math.max(1, Number(numberOfClasses || 1))
        : monthlyRate,
    [billingType, hourlyRate, monthlyRate, numberOfClasses]
  );

  if (!open) return null;

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const existing = document.getElementById("razorpay-js");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "razorpay-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });

  const finish = () => {
    onClose();
    router.push("/dashboard/student/my-classes");
  };

  const openRazorpay = async (
    order: any,
    regularClassId: string,
    classes: number
  ) => {
    if ((window as any).rzp_instance) {
      (window as any).rzp_instance.close();
      (window as any).rzp_instance = null;
    }

    delete (window as any).Razorpay;
    await loadRazorpayScript();

    if (!(window as any).Razorpay) {
      toast.error("Unable to load Razorpay");
      return;
    }

    const options = {
      key: order.razorpayKey || order.key,
      amount: order.amount,
      currency: order.currency,
      name: "TuitionsTime",
      description: "Regular Class Payment",
      order_id: order.orderId,
      handler: async (response: any) => {
        try {
          const verifyRes = await verifyGenericPayment(
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              planType: "regular",
              billingType,
              numberOfClasses: billingType === "hourly" ? classes : undefined,
              regularClassId,
            }
          );

          const isVerified =
            Boolean(verifyRes?.success) ||
            Boolean(verifyRes?.verified) ||
            Boolean(verifyRes?.data?.success) ||
            Boolean(verifyRes?.data?.verified);

          if (isVerified) {
            toast.success("Payment successful");
            finish();
          } else {
            toast.error(verifyRes?.message || "Verification failed");
          }
        } catch (err: any) {
          toast.error(err.message || "Verification failed");
        }
      },
      theme: { color: "#207EA9" },
    };

    const rzp = new (window as any).Razorpay(options);
    (window as any).rzp_instance = rzp;
    rzp.open();
  };

  const handleSubmit = async () => {
    try {
      if (!subject) {
        toast.error("Please select a subject");
        return;
      }

      if (billingType === "hourly" && Number(numberOfClasses) <= 0) {
        toast.error("Number of classes must be at least 1");
        return;
      }

      setLoading(true);

      const res = await startRegularDirect(tutorId, {
        subject,
        billingType,
        numberOfClasses:
          billingType === "hourly" ? Number(numberOfClasses) : undefined,
      });

      if (!res?.success) {
        toast.error(res?.message || "Could not start regular classes");
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
        finish();
        return;
      }

      await openRazorpay(orderRes, regularClassId, classes);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Start Regular Classes</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border rounded-lg p-3 bg-gray-50 mb-4 text-sm text-gray-800 space-y-1">
          <p>
            <span className="font-semibold">Hourly:</span> Rs.{hourlyRate} per
            class
          </p>
          <p>
            <span className="font-semibold">Monthly:</span> Rs.{monthlyRate} per
            month
          </p>
        </div>

        <label className="font-medium text-sm">Subject</label>
        <select
          className="border p-2 rounded w-full mt-1"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">Select subject</option>
          {subjects.map((item: string) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="font-medium text-sm mt-4 block">Billing Type</label>
        <select
          className="border p-2 rounded w-full mt-1"
          value={billingType}
          onChange={(e) => setBillingType(e.target.value as "hourly" | "monthly")}
        >
          <option value="hourly">Hourly (per class)</option>
          <option value="monthly">Monthly (subscription)</option>
        </select>

        {billingType === "hourly" && (
          <>
            <label className="font-medium text-sm mt-4 block">
              Number of Classes
            </label>
            <input
              type="number"
              min={1}
              className="border p-2 rounded w-full mt-1"
              value={numberOfClasses}
              onChange={(e) => setNumberOfClasses(Number(e.target.value))}
            />
          </>
        )}

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          Payable amount: <span className="font-semibold">Rs.{payable}</span>
        </div>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="bg-[#FFD54F] text-black mt-6 px-4 py-2 rounded w-full font-semibold hover:bg-[#f3c942] disabled:opacity-60"
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
}
