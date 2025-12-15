"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsAndConditionsPage() {
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
            TuitionsTime – Terms and Conditions
          </h1>

          <p className="text-slate-600 leading-7">
            Kindly read the following Terms and Conditions of TuitionsTime
            carefully before registering. These terms are designed to protect
            students, parents, tutors, and the organization. By accessing or
            using the TuitionsTime platform, you agree to be legally bound by
            these Terms and Conditions. If you do not agree to these Terms you
            are requested immediately <strong>NOT TO USE THIS PLATFORM</strong>.
          </p>

          {/* 1 */}
          <div>
            <h2 className="font-semibold text-lg">1. Acceptance of Terms</h2>
            <p className="text-slate-700 leading-7">
              By registering on TuitionsTime as a Student, Parent, or Tutor, you
              confirm that you have read, understood, and accepted these Terms
              and Conditions.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="font-semibold text-lg">2. Membership & Fees</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Registration is free for students and tutors under basic membership.</li>
              <li>Premium membership plans may be introduced in the future.</li>
              <li>
                Premium plans shall be governed by TuitionsTime Refund and
                Cancellation Policy.
              </li>
            </ul>
          </div>

          {/* 3 */}
          <div>
            <h2 className="font-semibold text-lg">
              3. Platform Communication Policy
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Direct communication between students and tutors is strictly
                prohibited before demo class confirmation.
              </li>
              <li>
                Personal contact details may be exchanged only after written or
                system-generated confirmation from TuitionsTime.
              </li>
              <li>
                Any attempt to bypass the platform or exchange personal details
                without authorization will be treated as a serious violation.
              </li>
            </ul>
          </div>

          {/* 4 */}
          <div>
            <h2 className="font-semibold text-lg">4. User Verification</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Users must provide valid mobile numbers, personal email IDs, and
                required identification documents.
              </li>
              <li>
                Fake, misleading, or impersonated profiles will be immediately
                terminated without notice.
              </li>
            </ul>
          </div>

          {/* 5 */}
          <div>
            <h2 className="font-semibold text-lg">
              5. Prohibited Content & Behaviour
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Posting or sharing illegal, abusive, obscene, pornographic,
                threatening, or misleading content is strictly prohibited.
              </li>
              <li>
                Any violation may result in account termination and legal action.
              </li>
            </ul>
          </div>

          {/* 6 */}
          <div>
            <h2 className="font-semibold text-lg">
              6. Right to Restrict or Terminate Access
            </h2>
            <p className="text-slate-700 leading-7">
              TuitionsTime reserves the absolute right to suspend, restrict, or
              permanently terminate any user account that violates these Terms
              and Conditions, without prior notice.
            </p>
          </div>

          {/* 7 */}
          <div>
            <h2 className="font-semibold text-lg">7. Student Guidelines</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Students may post tuition requirements free of charge.</li>
              <li>
                Students cannot contact tutors directly without demo confirmation.
              </li>
              <li>Unauthorized sharing of personal contact details is prohibited.</li>
            </ul>
          </div>

          {/* 8 */}
          <div>
            <h2 className="font-semibold text-lg">8. Tutor Guidelines</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Tutors may register for free but cannot contact students or
                parents without approval from TuitionsTime.
              </li>
              <li>
                Tutors will receive student details only after demo confirmation.
              </li>
              <li>
                In case of any fraud by the teachers with any student or with
                TuitionsTime, legal action may be taken.
              </li>
              <li>
                Tutors are requested to be punctual and behave, talk, and dress
                professionally while visiting any client for trial or regular
                class.
              </li>
            </ul>
          </div>

          {/* 9 */}
          <div>
            <h2 className="font-semibold text-lg">
              9. Payment & Service Charges
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                All tuition fees must be paid in advance to the official
                TuitionsTime account only.
              </li>
              <li>
                Direct payments between tutors and students or parents are
                strictly prohibited.
              </li>
              <li>
                TuitionsTime shall charge a 25% service fee per month on each
                active tuition class.
              </li>
              <li>
                Remaining amounts shall be settled with tutors as per
                TuitionsTime’s payout policy.
              </li>
            </ul>
          </div>

          {/* 10 */}
          <div>
            <h2 className="font-semibold text-lg">
              10. Access to Student Information
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Tutors cannot immediately view full student details.</li>
              <li>
                Access is granted only after verification and demo approval by
                TuitionsTime.
              </li>
            </ul>
          </div>

          {/* 11 */}
          <div>
            <h2 className="font-semibold text-lg">11. Tutor Payments</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Tutors shall receive payments only through the TuitionsTime
                platform.
              </li>
              <li>
                Payments made outside the platform are not recognized or
                protected by TuitionsTime.
              </li>
            </ul>
          </div>

          {/* 12 */}
          <div>
            <h2 className="font-semibold text-lg">
              12. Zero-Tolerance Policy for Direct Contact
            </h2>
            <p className="text-slate-700 leading-7">
              If any student, parent, or tutor is found attempting to contact
              each other directly for tuition services—before or after
              confirmation—their account will be immediately disabled or
              permanently terminated without notice.
            </p>
          </div>

          {/* 13 */}
          <div>
            <h2 className="font-semibold text-lg">
              13. Child Safety, POCSO Act & Mandatory Reporting
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                TuitionsTime strictly adheres to the Protection of Children from
                Sexual Offences (POCSO) Act, 2012.
              </li>
              <li>
                Any form of sexual abuse, harassment, grooming, exploitation,
                inappropriate communication, or misconduct involving a minor is
                a criminal offence punishable under law.
              </li>
              <li>
                TuitionsTime follows a zero-tolerance policy toward such conduct.
              </li>
              <li>
                Upon receiving any complaint or evidence, the concerned account
                will be suspended, and the matter may be reported to authorities.
              </li>
            </ul>
          </div>

          {/* 14 */}
          <div>
            <h2 className="font-semibold text-lg">
              14. Parental Responsibility for Minors
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Parents or guardians are solely responsible for the supervision
                and safety of minor students.
              </li>
              <li>
                TuitionsTime does not provide physical supervision.
              </li>
              <li>
                Tutors will teach only if at least one parent is present in the
                house.
              </li>
              <li>
                Parents may verify tutor identity and qualifications independently.
              </li>
            </ul>
          </div>

          {/* 15 */}
          <div>
            <h2 className="font-semibold text-lg">
              15. Limitation of Liability
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>
                TuitionsTime acts solely as a facilitating technology platform.
              </li>
              <li>
                TuitionsTime is not responsible for misconduct or disputes
                between users.
              </li>
              <li>
                Responsibility lies solely with the respective users.
              </li>
            </ul>
          </div>

          {/* 16 */}
          <div>
            <h2 className="font-semibold text-lg">16. Amendments</h2>
            <p className="text-slate-700 leading-7">
              TuitionsTime reserves the right to modify or update these Terms and
              Conditions at any time. Continued use of the platform constitutes
              acceptance of the revised terms. If you do not agree, you are
              requested immediately <strong>NOT TO USE THIS PLATFORM</strong>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
