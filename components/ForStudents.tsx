'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';
import { fadeInUp, scaleHover, useScrollAnimation } from './animations';

export default function ForStudents() {
  const { ref, isInView } = useScrollAnimation();

  const features = [
    'Find tutors by subject, rating, and price',
    'Book demo classes before committing',
    'Secure payment with wallet integration',
    'Access recordings and notes anytime',
    'Track your learning progress',
  ];

  return (
    <section
      ref={ref}
      className="relative py-20 bg-[#FFD54F] overflow-hidden"
    >
      {/* Decorative blur glow */}
      <motion.div
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/30 blur-3xl rounded-full"
        animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
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
            For Students
          </h2>
          <p className="text-lg text-gray-800 mb-8 leading-relaxed">
            Access quality education from the comfort of your home with
            personalized and engaging learning experiences.
          </p>

          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                whileHover={scaleHover}
              >
                <CheckCircle className="w-6 h-6 text-gray-900 shrink-0 mt-0.5" />
                <p className="text-gray-900 font-medium">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ---------- STUDENT CARD ---------- */}
        <motion.div
          className="relative p-8 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] bg-white border border-gray-100"
          whileHover={scaleHover}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#FFD54F] flex items-center justify-center text-gray-900 font-bold text-xl shadow-inner">
              JD
            </div>
            <div>
              <p className="font-bold text-gray-900">John Doe</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#FFD54F] text-[#FFD54F]"
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-700 italic mb-4">
            “TuitionTime transformed my learning experience. The tutors are
            incredibly knowledgeable and the platform is so easy to use!”
          </p>

          <p className="text-sm font-semibold text-gray-900">
            Computer Science Student
          </p>

          {/* Subtle decorative accent */}
          <motion.div
            className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#FFE97F] blur-2xl rounded-full opacity-70"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
