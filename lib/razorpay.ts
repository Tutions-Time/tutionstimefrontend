"use client";

let sdkPromise: Promise<void> | null = null;

type RazorpayCheckoutOrder = {
  orderId?: string;
  id?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
};

type RazorpayCheckoutOptions = {
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
};

type RazorpayCheckoutResponse = {
  orderId: string;
  paymentId: string;
  signature: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: any) => { open: () => void };
  }
}

export async function ensureRazorpaySdk() {
  if (typeof window === "undefined") {
    throw new Error("Razorpay checkout is only available in the browser");
  }

  if (window.Razorpay) return;

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById("razorpay-checkout-js");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay SDK")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
  }

  await sdkPromise;

  if (!window.Razorpay) {
    throw new Error("Razorpay SDK not available");
  }
}

export async function openRazorpayCheckout(
  order: RazorpayCheckoutOrder,
  options: RazorpayCheckoutOptions = {},
): Promise<RazorpayCheckoutResponse> {
  await ensureRazorpaySdk();

  const orderId = order.orderId || order.id;
  const key = order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY;

  if (!key) throw new Error("Razorpay key missing");
  if (!orderId) throw new Error("Missing Razorpay order id");

  return new Promise((resolve, reject) => {
    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      reject(new Error("Razorpay SDK not available"));
      return;
    }

    const checkout = new Razorpay({
      key,
      amount: order.amount,
      currency: order.currency || "INR",
      name: options.name || "TuitionsTime",
      description: options.description || "Student payment",
      order_id: orderId,
      prefill: options.prefill,
      theme: { color: "#207EA9" },
      handler: (response: any) => {
        resolve({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    checkout.open();
  });
}
