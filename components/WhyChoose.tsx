'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp, useScrollAnimation } from './animations';
import PrimaryButton from '@/components/PrimaryButton';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function WhyChoose() {
  const { ref, isInView } = useScrollAnimation();

  const sections = [
    {
      title: 'Need a Tutor?',
      subtitle: 'We’ll Match You with the Perfect One!',
      steps: ['Tell Us What You Need', 'Get a Free Demo Class', 'Choose If You Like'],
      buttonText: 'POST YOUR LEARNING NEEDS – FREE',
      image: '/images/tutor.jpg',
      reverse: false,
       link: '/signup?role=student',
    },
    {
      title: 'Are You a Tutor?',
      subtitle: 'Join as a Tutor and Inspire Learners',
      subtitle2: 'Share your knowledge and earn by teaching students who truly need your guidance',
      steps: ['Flexible schedule', 'Online teaching', 'Direct student connect'],
      buttonText: 'Register as Tutor',
      image: '/images/students.jpg',
      reverse: true,
      link: '/signup?role=tutor',
    },
  ];

  return (
    <section ref={ref} className="py-16 md:py-20 bg-[#FFD54F]">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="space-y-14 md:space-y-16">
          {sections.map((section, idx) => {
            const imageOrderMd = section.reverse ? 'md:order-2' : 'md:order-1';
            const contentOrderMd = section.reverse ? 'md:order-1' : 'md:order-2';

            return (
              <motion.div
                key={idx}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-10
                           grid grid-cols-12 gap-6 md:gap-10 items-center overflow-hidden"
                variants={fadeInUp}
              >
                {/* ---------- IMAGE SIDE ---------- */}
                <div
                  className={`col-span-12 md:col-span-5 order-1 ${imageOrderMd} flex justify-center md:justify-start`}
                >
                  <div className="relative w-full h-[240px] sm:h-[280px] md:h-[360px] rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      priority
                      sizes="(min-width:1024px) 420px, (min-width:768px) 60vw, 90vw"
                      className="object-cover object-center scale-105 hover:scale-110 transition-transform duration-700"
                    />
                    {/* Subtle white border overlay for crisp edge */}
                    <div className="absolute inset-0 ring-1 ring-white/60 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                {/* ---------- CONTENT SIDE ---------- */}
                <div
                  className={`col-span-12 md:col-span-7 order-2 ${contentOrderMd}
                              text-center md:text-left flex flex-col justify-center`}
                >
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-base md:text-lg font-semibold text-[#FFC107]">
                    {section.subtitle}
                  </p>
                  <p className="text-base md:text-lg font-semibold text-[#FFC107] mb-6 md:mb-7">
                    {section.subtitle2}
                  </p>

                  {/* Steps */}
                  <div
                    className={[
                      'flex items-center flex-wrap md:flex-nowrap justify-center md:justify-start gap-2 md:gap-3 mb-8 md:mb-10',
                    ].join(' ')}
                  >
                    {section.steps.map((step, i) => (
                      <div key={i} className="relative flex items-center gap-2 shrink-0">
                        <div
                          className="relative bg-gradient-to-br from-[#FFF9E6] to-white border border-gray-200
                                     rounded-xl shadow-sm px-4 py-3 whitespace-nowrap
                                     hover:border-[#FFD54F]/70 transition-all duration-200"
                        >
                          <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#FFD54F] text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-md">
                            {i + 1}
                          </div>
                          <p className="text-gray-800 font-medium text-sm md:text-base leading-snug">
                            {step}
                          </p>
                        </div>

                        {i < section.steps.length - 1 && (
                          <ChevronRight className="hidden md:block text-gray-400 w-4 h-4 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                <div
  className={`flex ${
    section.reverse ? 'md:justify-end' : 'md:justify-start'
  } justify-center`}
>
  <Link href={section.link}>
    <PrimaryButton className="bg-[#FFD54F] text-gray-900 font-semibold px-6 md:px-8 py-3 rounded-xl hover:bg-[#ffcb3d] transition-all shadow-md hover:shadow-lg">
      {section.buttonText}
    </PrimaryButton>
  </Link>
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
