'use client';
import Image from 'next/image';
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
      steps: ['Tell Us What You Need', 'Get a Free Demo Class', 'Choose If You Like'],
      buttonText: 'POST YOUR LEARNING NEEDS – FREE',
      image: '/images/schoolgirlBg.png',
      reverse: false,
    },
    {
      title: 'Are You a Tutor?',
      subtitle: 'Teach. Inspire. Earn.',
      steps: ['Create Your Profile', 'Get Verified Students', 'Start Earning Instantly'],
      buttonText: 'JOIN AS TUTOR – FREE',
      image: '/images/schoolgirlBg.png',
      reverse: true,
    },
  ];

  return (
    <section ref={ref} className="py-12 md:py-16 bg-gray-50">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="space-y-10 md:space-y-14">
          {sections.map((section, idx) => {
            const imageOrderMd = section.reverse ? 'md:order-2' : 'md:order-1';
            const contentOrderMd = section.reverse ? 'md:order-1' : 'md:order-2';
            const compact = idx === 0;

            return (
              <motion.div
                key={idx}
                className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 md:p-8
                           grid grid-cols-12 gap-4 md:gap-8 items-center overflow-hidden"
                variants={fadeInUp}
              >
                {/* IMAGE WITH ANIMATION */}
                <div
                  className={`col-span-12 md:col-span-5 order-1 ${imageOrderMd} flex justify-center md:justify-start`}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                      transition: { type: 'spring', stiffness: 150, damping: 12 },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full h-[240px] sm:h-[280px] md:h-[360px] ml-[-20px] md:ml-[-40px] rounded-2xl overflow-hidden"
                  >
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      priority
                      sizes="(min-width:1024px) 420px, (min-width:768px) 60vw, 90vw"
                      className="object-cover object-left transition-transform duration-500"
                    />
                  </motion.div>
                </div>

                {/* CONTENT SIDE */}
                <div
                  className={`col-span-12 md:col-span-7 order-2 ${contentOrderMd}
                              text-center md:text-left flex flex-col justify-center`}
                >
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    {section.title}
                  </h2>
                  <p className="text-base md:text-lg font-semibold text-[#FFD54F] mb-6 md:mb-7">
                    {section.subtitle}
                  </p>

                  {/* Steps */}
                  <div
                    className={[
                      'flex items-center',
                      'justify-center md:justify-start',
                      'gap-2 md:gap-3',
                      compact ? 'flex-wrap md:flex-nowrap' : 'flex-wrap',
                      'mb-7 md:mb-8',
                    ].join(' ')}
                  >
                    {section.steps.map((step, i) => (
                      <div key={i} className="relative flex items-center gap-2 shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={[
                            'relative bg-gradient-to-br from-[#FFF9E6] to-white border border-gray-200',
                            'rounded-xl shadow-sm transition-all duration-200 hover:border-[#FFD54F]/60',
                            compact ? 'px-3 py-2 md:px-3 md:py-2' : 'px-4 py-3',
                            'whitespace-nowrap shrink-0',
                          ].join(' ')}
                        >
                          <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#FFD54F] text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-md">
                            {i + 1}
                          </div>
                          <p
                            className={
                              compact
                                ? 'text-gray-800 font-medium text-sm leading-snug'
                                : 'text-gray-800 font-medium text-sm md:text-base leading-snug'
                            }
                          >
                            {step}
                          </p>
                        </motion.div>

                        {i < section.steps.length - 1 && (
                          <ChevronRight className="hidden md:block text-gray-400 w-4 h-4 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* CTA BUTTON */}
                  <div
                    className={`flex ${
                      section.reverse ? 'md:justify-end' : 'md:justify-start'
                    } justify-center`}
                  >
                    <PrimaryButton className="bg-[#FFD54F] text-gray-900 font-semibold px-6 md:px-7 py-3 rounded-xl hover:bg-[#ffcb3d] transition-all shadow-sm">
                      {section.buttonText}
                    </PrimaryButton>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
