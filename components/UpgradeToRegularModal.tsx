"use client";

import { useEffect, useState } from "react";
import { startRegularFromDemo } from "@/services/bookingService";
import {
  verifyGenericPayment,
  createSubscriptionOrder,
} from "@/services/razorpayService";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { openRazorpayCheckout } from "@/lib/razorpay";
const parseBudgetPreference = (budget = "") => {
  const text = String(budget || "");
  const hourly = Number(text.match(/Hourly:\s*(?:Rs\.?)?\s*(\d+)/i)?.[1] || 0);
  const monthly = Number(text.match(/Monthly:\s*(?:Rs\.?)?\s*(\d+)/i)?.[1] || 0);
  if (monthly > 0) return { billingType: "monthly" as const, amount: monthly };
  if (hourly > 0) return { billingType: "hourly" as const, amount: hourly };
  return null;
};

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
  const subjects = Array.isArray(booking?.subjects) && booking.subjects.length
    ? booking.subjects
    : booking?.subject
      ? [booking.subject]
      : [];
  const [subject, setSubject] = useState(subjects[0] || "");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const hourlyRate = booking?.tutorHourlyRate || 0;
  const monthlyRate = booking?.tutorMonthlyRate || 0;
  const subjectBudget = Array.isArray(booking?.studentSubjectBudgets)
    ? booking.studentSubjectBudgets.find((item: any) => item?.subject === subject)
    : null;
  const fallbackBudget = String(booking?.studentBudget || "").trim();
  const displayedBudget = subjectBudget?.amount
    ? `${subjectBudget.billingType === "monthly" ? "Monthly" : "Hourly"}: Rs.${subjectBudget.amount}`
    : fallbackBudget;
  const parsedFallbackBudget = parseBudgetPreference(fallbackBudget);
  const effectiveStudentBudget = subjectBudget?.amount
    ? {
        billingType: subjectBudget.billingType as "hourly" | "monthly",
        amount: Number(subjectBudget.amount),
      }
    : parsedFallbackBudget;
  const isTutorInitiatedDemo = booking?.requestedBy === "tutor";
  const payableHourlyRate = isTutorInitiatedDemo
    ? effectiveStudentBudget?.billingType === "hourly"
      ? Number(effectiveStudentBudget.amount || 0)
      : 0
    : Number(hourlyRate || 0);
  const payableMonthlyRate = isTutorInitiatedDemo
    ? effectiveStudentBudget?.billingType === "monthly"
      ? Number(effectiveStudentBudget.amount || 0)
      : 0
    : Number(monthlyRate || 0);
  const displayHourlyRate = payableHourlyRate ? `Rs.${payableHourlyRate}` : "-";
  const displayMonthlyRate = payableMonthlyRate ? `Rs.${payableMonthlyRate}` : "-";

  useEffect(() => {
    if (isTutorInitiatedDemo && effectiveStudentBudget?.billingType) {
      setBillingType(effectiveStudentBudget.billingType);
    }
  }, [isTutorInitiatedDemo, effectiveStudentBudget?.billingType]);

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
        subject,
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

        {subjects.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium">Subject</label>
            <select
              className="mt-1 w-full rounded border p-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {subjects.map((item: string) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}

        {isTutorInitiatedDemo && displayedBudget && (
          <div className="mb-4 rounded-lg border bg-yellow-50 p-3 text-sm text-gray-800">
            <span className="font-semibold">Student budget for {subject || "this subject"}: </span>
            {displayedBudget}
          </div>
        )}

        <div className="mb-4 rounded-lg border bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-700">{isTutorInitiatedDemo ? "Student Budget" : "Tutor Rates"}</p>
          <div className="mt-1 space-y-1 text-sm text-gray-800">
            <p>
              <span className="font-semibold">Hourly: </span>{displayHourlyRate} per
              class
            </p>
            <p>
              <span className="font-semibold">Monthly: </span>{displayMonthlyRate} per
              month
            </p>
          </div>
        </div>

        <label className="mt-2 text-sm font-medium">Billing Type</label>
        <select
          className="mt-1 w-full rounded border p-2"
          value={billingType}
          disabled={isTutorInitiatedDemo}
          onChange={(e) =>
            setBillingType(e.target.value as "hourly" | "monthly")
          }
        >
          <option value="hourly" disabled={isTutorInitiatedDemo && effectiveStudentBudget?.billingType !== "hourly"}>Hourly (per class)</option>
          <option value="monthly" disabled={isTutorInitiatedDemo && effectiveStudentBudget?.billingType !== "monthly"}>Monthly (subscription)</option>
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





