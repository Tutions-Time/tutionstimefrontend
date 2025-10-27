'use client';
import { motion } from 'framer-motion';
import { fadeInUp, useScrollAnimation } from './animations';
import PrimaryButton from '@/components/PrimaryButton';
import { ChevronRight } from 'lucide-react';

export default function WhyChoose() {
  const { ref, isInView } = useScrollAnimation();

  const sections = [
    {
      title: 'Need a Tutor?',
      subtitle: 'We’ll Match You with the Perfect One!',
      steps: [
        'Tell Us What You Need',
        'Get a Free Demo Class',
        'Choose If You Like',
      ],
      buttonText: 'POST YOUR LEARNING NEEDS – FREE',
    },
    {
      title: 'Are You a Tutor?',
      subtitle: 'Teach. Inspire. Earn.',
      steps: [
        'Create Your Profile',
        'Get Verified Students',
        'Start Earning Instantly',
      ],
      buttonText: 'JOIN AS TUTOR – FREE',
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="space-y-16">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-3xl shadow-soft p-10 text-center border border-gray-100"
              variants={fadeInUp}
            >
              {/* Header */}
              <h2 className="text-2xl lg:text-3xl font-bold text-text mb-2">
                {section.title}
              </h2>
              <p className="text-lg font-semibold text-primary mb-10">
                {section.subtitle}
              </p>

              {/* Steps Row */}
              <div className="flex flex-col md:flex-row items-cente justify-center gap-8 mb-10">
                {section.steps.map((step, i) => (
                  <div key={i} className="relative flex items-center gap-4">
                    {/* Step Box */}
                    <motion.div
                      whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}
                      className="relative bg-gradient-to-br from-primary to-gray-50 border border-gray-200 rounded-2xl p-6 w-60 shadow-sm transition-all duration-300 hover:border-primary/50"
                    >
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {i + 1}
                      </div>
                      <p className="text-gray-800 font-medium text-base leading-relaxed">
                        {step}
                      </p>
                    </motion.div>

                    {/* Arrow (Desktop only) */}
                    {i < section.steps.length - 1 && (
                      <ChevronRight className="hidden md:block text-gray-400 w-6 h-6" />
                    )}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <PrimaryButton className="bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all">
                {section.buttonText}
              </PrimaryButton>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
