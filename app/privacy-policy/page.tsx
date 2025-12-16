"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 sm:px-10 py-10 space-y-10">
          {/* Header */}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            TuitionsTime Privacy Policy
          </h1>

          {/* Intro */}
          <p className="text-slate-600 leading-7">
            This Privacy Policy describes how TuitionsTime collects, uses, and
            protects your personal information when you use our website and
            services.
          </p>

          {/* Information Collection */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              What information do we collect?
            </h2>

            <p className="text-slate-700 mb-3">
              We collect the following types of information about you:
            </p>

            <h3 className="font-semibold text-slate-900 mb-2">
              Information you provide us directly:
            </h3>

            <ul className="list-disc pl-6 text-slate-700 space-y-3">
              <li>
                We ask for certain information such as your username, birthrate,
                address, phone number and e-mail address when you register for a
                TuitionsTime account. We use this information to operate,
                maintain, and provide the features and functionality of the
                Service.
              </li>
              <li>
                If you transact with us, we collect additional information such
                as billing address, credit/debit card number, card expiration
                date, and other payment instrument details or tracking
                information from cheques or money orders.
              </li>
              <li>
                We collect personally identifiable information (email address,
                name, phone number, credit/debit card or other payment
                instrument details, etc.) when you set up an account with us. We
                do not share any details without registration. We may use your
                contact information to send inquiries based on your previous
                tuition or tutoring needs.
              </li>
            </ul>
          </div>

          {/* Third Party Info */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Information we may receive from third parties:
            </h3>

            <p className="text-slate-700 leading-7">
              We may receive information about you from third parties if you
              access our website through third-party connections such as
              Facebook Connect or similar services. This information may include
              your user ID, access token, and any information you have permitted
              the third party to share or made public through that service.
            </p>
          </div>

          {/* Usage */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              What do we use your information for?
            </h2>

            <p className="text-slate-700 mb-3">
              Any of the information we collect may be used in one of the
              following ways:
            </p>

            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                <strong>To personalize your experience:</strong> Your
                information helps us better respond to your individual needs.
              </li>
              <li>
                <strong>To improve our site:</strong> We continuously strive to
                improve our website offerings.
              </li>
              <li>
                <strong>To improve customer service:</strong> Your information
                helps us effectively respond to your service requests and
                support needs.
              </li>
              <li>
                <strong>To send periodic emails:</strong> The email address you
                provide may be used to send information, respond to inquiries,
                or other requests.
              </li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              How do we protect your information?
            </h2>
            <p className="text-slate-700 leading-7">
              We implement a variety of security measures to maintain the safety
              of your personal information when you enter, submit, or access
              your personal information. After a transaction, sensitive
              financial information such as credit card details will not be
              stored on our servers.
            </p>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Do we use cookies?
            </h2>
            <p className="text-slate-700 leading-7">
              Yes. Cookies are small files transferred to your computer’s hard
              drive through your web browser that enable us to recognize your
              browser and remember certain information. We use cookies to
              understand and save your preferences for future visits.
            </p>
          </div>

          {/* Disclosure */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Do we disclose any information to outside parties?
            </h2>
            <p className="text-slate-700 leading-7">
              We do not sell, trade, or otherwise transfer your personally
              identifiable information to outside parties. This excludes
              trusted third parties who assist us in operating our website or
              servicing you, provided they agree to keep the information
              confidential. We may release information when required by law or
              to protect rights, property, or safety. Non-personally
              identifiable visitor information may be shared for marketing or
              analytics purposes.
            </p>
          </div>

          {/* COPPA */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Children’s Online Privacy Protection Act Compliance
            </h2>
            <p className="text-slate-700 leading-7">
              We are in compliance with the requirements of COPPA (Children’s
              Online Privacy Protection Act).
            </p>
          </div>

          {/* Online Only */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Online Privacy Policy Only
            </h2>
            <p className="text-slate-700 leading-7">
              This online privacy policy applies only to information collected
              through our website and not to information collected offline.
            </p>
          </div>

          {/* Terms */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Terms and Conditions
            </h2>
            <p className="text-slate-700 leading-7">
              Please also visit our Terms and Conditions section establishing
              the use, disclaimers, and limitations of liability governing the
              use of our website at{" "}
              <span className="font-medium">www.tuitionstime.com</span>.
            </p>
          </div>

          {/* Acceptance */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Your acceptance of these terms
            </h2>
            <p className="text-slate-700 leading-7">
              By using our site, you consent to our privacy policy. If you do not
              agree to this policy, please do not use our site.
            </p>
          </div>

          {/* Changes */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Changes to our Privacy Policy
            </h2>
            <p className="text-slate-700 leading-7">
              TuitionsTime.com reserves the right to update this privacy policy
              at any time. Any changes will be posted on this page.
            </p>
            <p className="text-slate-700 mt-2">
              <strong>This policy was last modified on:</strong> 1-12-2025
            </p>
          </div>

          {/* Contact */}
          <div className="pt-4 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Contacting Us
            </h2>
            <p className="text-slate-700 leading-7">
              If you have any questions regarding this privacy policy, you may
              contact us using the information below:
            </p>
            <p className="mt-2 text-slate-700 font-medium">
              www.tuitionstime.com
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
