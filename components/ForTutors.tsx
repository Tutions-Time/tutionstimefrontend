'use client';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { fadeInUp, scaleHover, useScrollAnimation } from './animations';

export default function ForTutors() {
  const { ref, isInView } = useScrollAnimation();

  const features = [
    'Set your own rates and schedule',
    'Secure and instant payments',
    'Built-in video conferencing and whiteboard',
    'Track your earnings and performance',
    'Grow your student base',
  ];

  return (
    <section ref={ref} className="relative py-20 bg-[#FFD54F] overflow-hidden">
      {/* Decorative blur glow */}
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 bg-white/30 blur-3xl rounded-full"
        animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-2 gap-16 items-center"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* ---------- LEFT CONTENT (Card) ---------- */}
        <motion.div
          className="order-2 lg:order-1 relative p-8 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] bg-white border border-gray-100"
          whileHover={scaleHover}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700">This Month</p>
              <TrendingUp className="w-5 h-5 text-gray-900" />
            </div>

            <div>
              <p className="text-4xl font-extrabold text-gray-900">₹45,680</p>
              <p className="text-sm text-gray-700 mt-1">Total Earnings</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-2xl font-bold text-gray-900">28</p>
                <p className="text-sm text-gray-700">Classes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.9</p>
                <p className="text-sm text-gray-700">Rating</p>
              </div>
            </div>
          </div>

          {/* Soft glow animation */}
          <motion.div
            className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FFE97F] blur-2xl rounded-full opacity-70"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* ---------- RIGHT CONTENT (Text + Features) ---------- */}
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">
            For Tutors
          </h2>
          <p className="text-lg text-gray-800 mb-8 leading-relaxed">
            Share your expertise and earn money while making a difference in students’ lives. 
            Enjoy full flexibility and a growing learning community.
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
      </motion.div>
    </section>
  );
}
