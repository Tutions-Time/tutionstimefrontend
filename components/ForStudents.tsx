'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    <section ref={ref} className="py-20">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-text mb-6">For Students</h2>
          <p className="text-lg text-muted mb-8">
            Access quality education from the comfort of your home with personalized learning experiences.
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

        <motion.div
          className="p-8 rounded-2xl shadow-soft bg-gradient-to-br from-primaryWeak to-white"
          whileHover={scaleHover}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary"></div>
            <div>
              <p className="font-bold text-text">John Doe</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-muted italic mb-4">
            “Tuitions time transformed my learning experience. The tutors are incredibly knowledgeable and the platform is so easy to use!”
          </p>
          <p className="text-sm font-medium text-text">Computer Science Student</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
