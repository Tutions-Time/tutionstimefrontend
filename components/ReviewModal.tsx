"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { closeReviewModal } from "@/store/slices/reviewSlice";
import { submitReview } from "@/services/reviewService";
import { Star } from "lucide-react";
import { startRegularFromDemo } from "@/services/bookingService";
import { verifyGenericPayment, createSubscriptionOrder } from "@/services/razorpayService";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ReviewModal() {
  const dispatch = useDispatch();
  const { shouldShowReview, tutorName, bookingId } = useSelector(
    (state: RootState) => state.review
  );

  const [teaching, setTeaching] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [understanding, setUnderstanding] = useState(0);
  const [comment, setComment] = useState("");
  const [likedTutor, setLikedTutor] = useState<boolean | null>(null);

  const [step, setStep] = useState(1);
  const [tutorRates, setTutorRates] = useState<any>(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [hourlyCount, setHourlyCount] = useState(4);
  const router = useRouter();

  if (!shouldShowReview) return null;

  const sendReview = async () => {
    if (!bookingId) return;
    if (!teaching || !communication || !understanding) {
      toast.error("Please rate all sections.");
      return;
    }
    if (likedTutor === null) {
      toast.error("Please select if you liked the tutor.");
      return;
    }

    try {
      const res = await submitReview(bookingId, {
        teaching,
        communication,
        understanding,
        comment,
        likedTutor: likedTutor ?? false,
      });

      if (res?.data?.tutorRates && likedTutor === true) {
        setTutorRates(res.data.tutorRates);
        setStep(2);
        return;
      }

      dispatch(closeReviewModal());
    } catch (err: any) {
      const message = (err?.message || "").toLowerCase();
      if (message.includes("already submitted")) {
        toast.error("Feedback already submitted.");
        dispatch(closeReviewModal());
        return;
      }
      toast.error(err?.message || "Failed to submit feedback");
    }
  };

  const Stars = ({ value, setter }: { value: number; setter: (n: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          onClick={() => setter(n)}
          className={`w-6 h-6 cursor-pointer ${
            value >= n ? "text-yellow-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const hourlyRate = Number(tutorRates?.hourlyRate || 0);
  const monthlyRate = Number(tutorRates?.monthlyRate || 0);
  const hourlyTotal = hourlyRate * Math.max(1, Number(hourlyCount || 0));

  const PaymentStep = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        How would you like to pay?
      </h2>

      <div className="w-full border p-3 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Hourly</span>
          <span className="text-sm text-gray-600">₹{hourlyRate}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Classes</label>
          <input
            type="number"
            min={1}
            value={hourlyCount}
            onChange={(e) => setHourlyCount(Number(e.target.value || 1))}
            className="w-24 border rounded-md px-2 py-1 text-sm"
          />
          <div className="text-sm text-gray-600">Total ₹{hourlyTotal}</div>
        </div>
        <button
          className="w-full bg-primary text-black font-semibold py-2 rounded-lg"
          onClick={() => handlePaymentType("hourly")}
          disabled={loadingPay}
        >
          Continue Hourly
        </button>
      </div>

      <button
        className="w-full border p-3 rounded-lg text-left"
        onClick={() => handlePaymentType("monthly")}
        disabled={loadingPay}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold">Monthly</span>
          <span className="text-sm text-gray-600">₹{monthlyRate}</span>
        </div>
      </button>
    </div>
  );

  const openRazorpay = (order: any, meta: { billingType: "hourly" | "monthly"; numberOfClasses?: number; regularClassId: string }) => {
    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK not loaded");
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
              billingType: meta.billingType,
              numberOfClasses: meta.numberOfClasses,
              regularClassId: meta.regularClassId,
            }
          );
          if (verifyRes?.success) {
            toast.success("Payment successful and verified!");
            dispatch(closeReviewModal());
            router.push(`/dashboard/student/demoBookings`);
          } else {
            toast.error(verifyRes?.message || "Verification failed");
          }
        } catch (e: any) {
          toast.error(e.message || "Verification failed");
        }
      },
      theme: { color: "#207EA9" },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handlePaymentType = async (type: "hourly" | "monthly") => {
    if (!bookingId) return;
    try {
      setLoadingPay(true);
      const payload: any = {
        planType: "regular",
        billingType: type,
      };
      if (type === "hourly") {
        payload.numberOfClasses = Math.max(1, Number(hourlyCount || 1));
      }
      const res = await startRegularFromDemo(bookingId, payload);
      if (!res?.success) {
        toast.error(res?.message || "Checkout failed");
        return;
      }
      const rcId = res?.data?.regularClassId;
      const classes = type === "hourly" ? Number(payload.numberOfClasses) : 1;
      const orderRes = await createSubscriptionOrder({
        regularClassId: rcId,
        billingType: type,
        numberOfClasses: classes,
        // couponCode: couponCode.trim() || undefined,
      });
      if ((orderRes as any)?.walletPaid) {
        toast.success("Payment successful via wallet!");
        dispatch(closeReviewModal());
        router.push(`/dashboard/student/demoBookings`);
      } else {
        openRazorpay(orderRes, { billingType: type, numberOfClasses: payload.numberOfClasses, regularClassId: rcId });
      }
    } catch (err: any) {
      toast.error(err.message || "Payment init failed");
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative bg-white w-[90%] max-w-md rounded-2xl p-6 space-y-5 shadow-xl">
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">
              How was your demo with {tutorName}?
            </h2>

            <div className="space-y-3">
              <div>
                <label className="font-medium">Teaching</label>
                <Stars value={teaching} setter={setTeaching} />
              </div>

              <div>
                <label className="font-medium">Communication</label>
                <Stars value={communication} setter={setCommunication} />
              </div>

              <div>
                <label className="font-medium">Understanding</label>
                <Stars value={understanding} setter={setUnderstanding} />
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm"
              placeholder="Write your feedback..."
            />

            <div className="mt-4">
              <p className="font-medium text-gray-900 mb-2">Did you like the tutor?</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLikedTutor(true)}
                  className={`py-3 rounded-lg border font-semibold transition ${
                    likedTutor === true
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Yes
                </button>

                <button
                  onClick={() => setLikedTutor(false)}
                  className={`py-3 rounded-lg border font-semibold transition ${
                    likedTutor === false
                      ? "bg-red-500 text-white border-red-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <button
              onClick={sendReview}
              className="w-full bg-[#FFD54F] text-black font-semibold py-3 rounded-full hover:bg-[#eac747]"
            >
              Submit Review
            </button>
          </>
        )}

        {step === 2 && <PaymentStep />}
      </div>
    </div>
  );
}
