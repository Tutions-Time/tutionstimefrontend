'use client';
import { motion } from 'framer-motion';
import { fadeInUp, scaleHover, useScrollAnimation } from './animations';

export default function AboutUs() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="relative py-24 bg-white overflow-hidden"
    >
      {/* Decorative glow accents */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#FFE98A]/30 blur-3xl rounded-full"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FFF2B4]/40 blur-3xl rounded-full"
        animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
      />

      {/* CONTENT WRAPPER */}
      <motion.div
        className="relative max-w-5xl mx-auto px-6 sm:px-10 text-center"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* TITLE */}
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
          About <span className="text-primary">TuitionTimes</span>
        </h2>

        {/* SUBTITLE */}
        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
          TuitionTime is a modern platform connecting students and tutors across India. 
          Our mission is to make quality education accessible, flexible, and affordable 
          for every learner.
        </p>

        {/* Decorative divider */}
        <motion.div
          className="mx-auto mt-10 mb-4 h-1.5 w-24 bg-primary rounded-full"
          whileHover={{ scale: 1.05 }}
        />

        {/* ACCENT STATEMENT CARD */}
        <motion.div
          className="mt-12 bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_10px_28px_rgba(0,0,0,0.1)] max-w-3xl mx-auto"
          whileHover={scaleHover}
        >
          <p className="text-gray-800 text-lg leading-relaxed">
            Whether you're looking to strengthen fundamentals, prepare for exams, 
            or learn at your own pace, TuitionTime empowers you with verified tutors, 
            one-to-one sessions, and personalized learning paths designed for success.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
