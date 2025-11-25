'use client';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { fadeInUp, scaleHover, useScrollAnimation } from './animations';

export default function WhyChooseUs() {
  const { ref, isInView } = useScrollAnimation();

  const points = [
    'Verified & Experienced Tutors',
    'One-to-One Personalized Learning',
    'Flexible Timings (Online & Offline)',
    'Transparent Fee Structure',
    'Continuous Performance Tracking',
  ];

  return (
    <section
      ref={ref}
      className="relative py-20 bg-white overflow-hidden"
    >
      {/* Decorative blur glow */}
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 bg-[#FFD54F]/40 blur-3xl rounded-full"
        animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-2 gap-16 items-center"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* ---------- LEFT CONTENT ---------- */}
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">
            Why Choose <span className="text-primary">TuitionTime?</span>
          </h2>

          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            We connect students with the best tutors across India—making
            high-quality learning accessible, convenient, and truly personalized.
          </p>

          <div className="space-y-4">
            {points.map((point, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                whileHover={scaleHover}
              >
                <CheckCircle className="w-6 h-6 text-[#F9A825] shrink-0 mt-0.5" />
                <p className="text-gray-900 font-medium">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ---------- RIGHT SIDE CARD ---------- */}
        <motion.div
          className="relative p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] bg-white border border-gray-100"
          whileHover={scaleHover}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Quality You Can Trust
          </h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            Every tutor on our platform goes through a strict verification
            process. We ensure that students receive personalized, consistent,
            and measurable learning outcomes.
          </p>

          {/* Soft gradient highlight */}
          <motion.div
            className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FFD54F]/50 blur-2xl rounded-full opacity-70"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
