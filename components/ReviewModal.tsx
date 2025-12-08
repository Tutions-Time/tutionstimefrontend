"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { closeReviewModal } from "@/store/slices/reviewSlice";
import { submitReview } from "@/services/reviewService";
import { Star, X } from "lucide-react";
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
  const router = useRouter();

  if (!shouldShowReview) return null;

  const sendReview = async () => {
    if (!bookingId) return;

    const res = await submitReview(bookingId, {
      teaching,
      communication,
      understanding,
      comment,
      likedTutor: likedTutor ?? false,
    });

    // If user liked tutor → Go to step 2
    if (res?.data?.tutorRates && likedTutor === true) {
      setTutorRates(res.data.tutorRates);
      setStep(2);
      return;
    }

    // Otherwise simply close modal
    dispatch(closeReviewModal());
  };

  // ⭐ reusable star component
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

  const PaymentStep = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        How would you like to pay?
      </h2>

      <button
        className="w-full border p-3 rounded-lg text-left"
        onClick={() => handlePaymentType("hourly")}
      >
        <span className="font-semibold">Hourly</span> – ₹{tutorRates?.hourlyRate}
      </button>

      <button
        className="w-full border p-3 rounded-lg text-left"
        onClick={() => handlePaymentType("monthly")}
      >
        <span className="font-semibold">Monthly</span> – ₹{tutorRates?.monthlyRate}
      </button>

      <div>
        <label className="font-medium text-sm">Coupon Code (optional)</label>
        <input
          type="text"
          className="border p-2 rounded w-full mt-1"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon if you have one"
        />
      </div>
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
        payload.numberOfClasses = 4;
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
        couponCode: couponCode.trim() || undefined,
      });
      openRazorpay(orderRes, { billingType: type, numberOfClasses: payload.numberOfClasses, regularClassId: rcId });
    } catch (err: any) {
      toast.error(err.message || "Payment init failed");
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative bg-white w-[90%] max-w-md rounded-2xl p-6 space-y-5 shadow-xl">

        {/* Close button */}
        <button
          onClick={() => dispatch(closeReviewModal())}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        {/* ---------------- STEP 1 ---------------- */}
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

            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setLikedTutor(true)}
                className={`px-4 py-2 rounded-lg border ${
                  likedTutor === true ? "bg-green-500 text-white" : ""
                }`}
              >
                Yes 👍
              </button>

              <button
                onClick={() => setLikedTutor(false)}
                className={`px-4 py-2 rounded-lg border ${
                  likedTutor === false ? "bg-red-500 text-white" : ""
                }`}
              >
                No 👎
              </button>
            </div>

            <button
              onClick={sendReview}
              className="w-full bg-[#FFD54F] text-black font-semibold py-3 rounded-full hover:bg-[#eac747]"
            >
              Submit Review
            </button>
          </>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Do you want to continue regular classes with {tutorName}?
            </h2>

            <button
              className="w-full bg-green-500 text-white py-3 rounded-lg"
              onClick={() => setStep(3)}
            >
              Continue Regular Classes
            </button>

            <button
              className="w-full border py-3 rounded-lg"
              onClick={() => dispatch(closeReviewModal())}
            >
              Find Another Tutor
            </button>
          </div>
        )}

        {/* ---------------- STEP 3 ---------------- */}
        {step === 3 && <PaymentStep />}
      </div>
    </div>
  );
}
