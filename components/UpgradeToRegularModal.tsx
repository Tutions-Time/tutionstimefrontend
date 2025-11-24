"use client";

import { useState } from "react";
import { startRegularFromDemo } from "@/services/bookingService";
import { verifyGenericPayment } from "@/services/razorpayService";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UpgradeToRegularModal({
    booking,
    onClose,
}: {
    booking: any;
    onClose: () => void;
}) {

    const [billingType, setBillingType] = useState<"hourly" | "monthly">("hourly");
    const [numberOfClasses, setNumberOfClasses] = useState(4);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const hourlyRate = booking?.tutorHourlyRate || 0;
    const monthlyRate = booking?.tutorMonthlyRate || 0;

    const openRazorpay = (order: any) => {
        if (!(window as any).Razorpay) {
            toast.error("Razorpay SDK not loaded");
            return;
        }
        const options = {
            key: order.razorpayKey,
            amount: order.amount,
            currency: order.currency,
            name: "TuitionTime",
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
                            numberOfClasses:
                                billingType === "hourly"
                                    ? Number(numberOfClasses)
                                    : undefined,
                            regularClassId: order.regularClassId,
                        }
                    );

                    if (verifyRes?.success) {
                        toast.success("Payment successful and verified!");
                        router.push(`/dashboard/student/demoBookings?tab=regular`);
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

            openRazorpay(res.data);
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Start Regular Classes</h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* RATE BOX */}
                <div className="border rounded-lg p-3 bg-gray-50 mb-4">
                    <p className="text-sm font-medium text-gray-700">
                        💰 Tutor Rates
                    </p>
                    <div className="mt-1 text-sm text-gray-800 space-y-1">
                        <p>
                            <span className="font-semibold">Hourly: </span>
                            ₹{hourlyRate} per class
                        </p>
                        <p>
                            <span className="font-semibold">Monthly: </span>
                            ₹{monthlyRate} per month
                        </p>
                    </div>
                </div>

                {/* BILLING TYPE */}
                <label className="font-medium text-sm mt-2">Billing Type</label>
                <select
                    className="border p-2 rounded w-full mt-1"
                    value={billingType}
                    onChange={(e) =>
                        setBillingType(e.target.value as "hourly" | "monthly")
                    }
                >
                    <option value="hourly">Hourly (per class)</option>
                    <option value="monthly">Monthly (subscription)</option>
                </select>

                {/* NUMBER OF CLASSES */}
                {billingType === "hourly" && (
                    <>
                        <label className="font-medium text-sm mt-4">
                            Number of Classes
                        </label>
                        <input
                            type="number"
                            className="border p-2 rounded w-full mt-1"
                            value={numberOfClasses}
                            onChange={(e) => setNumberOfClasses(Number(e.target.value))}
                        />
                    </>
                )}

                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="bg-[#FFD54F] text-black mt-6 px-4 py-2 rounded w-full font-semibold hover:bg-[#FFD54F]"
                >
                    {loading ? "Processing..." : "Proceed to Payment"}
                </button>
            </div>
        </div>
    );
}
