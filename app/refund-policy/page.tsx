"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Back Button */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Container */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 sm:px-10 py-10 space-y-8">
          {/* Header */}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Refund Policy
          </h1>

          <p className="text-slate-600 leading-7">
            At TuitionsTime.com, we strive to provide high-quality educational
            services to meet your learning needs. However, we understand that
            there may be situations where you are not completely satisfied. This
            Refund Policy outlines the terms and conditions under which refunds
            may be requested.
          </p>

          {/* Eligible Refund Cases */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Eligible Refund Cases
            </h2>
            <p className="text-slate-700 mb-3">
              Refunds may be considered under the following circumstances:
            </p>

            <div className="space-y-6">
              {/* 1 */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  1. Incorrect Payment or Technical Issues
                </h3>
                <p className="text-slate-700 leading-7">
                  If an incorrect amount is credited or if technical issues from
                  our side prevent access to the tutoring session and the issue
                  cannot be resolved within a reasonable time.
                </p>
              </div>

              {/* 2 */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  2. Tutor Unavailability Due to Emergency
                </h3>
                <p className="text-slate-700 leading-7 mb-2">
                  In the event of an emergency where the assigned tutor for home
                  tuition is unavailable, we will:
                </p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>Assign a new tutor as an alternative, or</li>
                  <li>
                    Offer the option to continue the remaining sessions in
                    online mode (if available).
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Non-Refundable Cases */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Non-Refundable Cases
            </h2>
            <p className="text-slate-700 mb-3">
              Refunds will not be provided under the following conditions:
            </p>

            <ul className="list-decimal pl-6 text-slate-700 space-y-4">
              <li>
                Once a tuition has been confirmed, the fee is non-refundable.
              </li>

              <li>
                Personal reasons such as getting a job elsewhere or relocating
                will not be considered for refunds. However, since we operate
                across India, your credits can be used in any city of your
                choice.
              </li>

              <li>
                If you have confirmed your classes after a demo session and later
                change your mind after the tutoring session has been delivered,
                the advance fee will not be refunded. In case of an emergency
                with a home tuition tutor, we can offer an alternative tutor or
                switch to online mode if available.
              </li>

              <li>
                Failure to attend a scheduled tutoring session will not be
                eligible for a refund.
              </li>
            </ul>
          </div>

          {/* Policy Modifications */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Policy Modifications
            </h2>
            <p className="text-slate-700 leading-7">
              TuitionsTime.com reserves the right to modify this Refund Policy at
              any time. Any changes or clarifications will take effect
              immediately upon being posted on the website. It is your
              responsibility to review this policy periodically.
            </p>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-slate-700 leading-7">
              We aim to keep our refund policy fair and transparent. If you have
              any questions, please feel free to contact us through our official
              support number.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
