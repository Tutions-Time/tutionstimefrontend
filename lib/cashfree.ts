"use client";

let sdkPromise: Promise<any> | null = null;

function getMode(): "sandbox" | "production" {
  const raw = String(
    process.env.NEXT_PUBLIC_CASHFREE_ENV ||
      process.env.NEXT_PUBLIC_CASHFREE_MODE ||
      (process.env.NODE_ENV === "production" ? "production" : "sandbox"),
  ).toLowerCase();

  return raw === "production" || raw === "live" ? "production" : "sandbox";
}

export async function ensureCashfreeSdk() {
  if (typeof window === "undefined") {
    throw new Error("Cashfree checkout is only available in the browser");
  }

  if (typeof window.Cashfree === "function") {
    return (window.Cashfree as any)({ mode: getMode() });
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById("cashfree-js");
      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Cashfree SDK")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "cashfree-js";
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
      document.body.appendChild(script);
    });
  }

  await sdkPromise;

  if (!window.Cashfree) {
    throw new Error("Cashfree SDK not available");
  }

  return (window.Cashfree as any)({ mode: getMode() });
}

export async function openCashfreeCheckout(paymentSessionId: string) {
  if (!paymentSessionId) {
    throw new Error("Missing payment session");
  }

  const cashfree = await ensureCashfreeSdk();
  return cashfree.checkout({
    paymentSessionId,
    redirectTarget: "_modal",
  });
}
