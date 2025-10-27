'use client';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { fadeInUp, scaleHover, useScrollAnimation } from './animations';
import { Card } from '@/components/ui/card';

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
    <section ref={ref} className="py-20 bg-gray-50">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.div
          className="p-8 rounded-2xl shadow-soft bg-gradient-to-br from-primaryWeak to-white order-2 lg:order-1"
          whileHover={scaleHover}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-muted">This Month</p>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-4xl font-bold text-text">₹45,680</p>
              <p className="text-sm text-muted mt-1">Total Earnings</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-2xl font-bold text-text">28</p>
                <p className="text-sm text-muted">Classes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text">4.9</p>
                <p className="text-sm text-muted">Rating</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl lg:text-4xl font-bold text-text mb-6">For Tutors</h2>
          <p className="text-lg text-muted mb-8">
            Share your expertise and earn money while making a difference in students' lives.
          </p>

          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div key={i} className="flex items-start gap-3" whileHover={scaleHover}>
                <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5" />
                <p className="text-text">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
