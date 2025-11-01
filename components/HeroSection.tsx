'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  slideInLeft,
  fadeInUp,
  floatHover,
  floatLoop,
  staggerContainer,
  useScrollAnimation,
} from './animations';

export default function HeroSection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 lg:py-36 bg-[#FFD54F]" // ✅ Yellow background
    >
      {/* Soft background glow (lighter yellow for depth) */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 bg-white/30 blur-3xl rounded-full"
        animate={floatLoop.animate}
      />

      <motion.div
        className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center relative"
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* ---------- LEFT CONTENT ---------- */}
        <motion.div variants={slideInLeft}>
          <motion.h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 space-y-2">
            {/* Learn Smarter */}
            <motion.span
              className="block text-gray-900"
              animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror',
              }}
              whileHover={{
                scale: 1.1,
                rotate: 1,
                transition: { type: 'spring', stiffness: 200, damping: 10 },
              }}
            >
              Learn Smarter
            </motion.span>

            {/* Teach Better */}
            <motion.span
              className="block text-gray-900"
              animate={{ y: [0, 8, 0], scale: [1, 1.03, 1] }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror',
                delay: 0.5,
              }}
              whileHover={{
                scale: 1.1,
                rotate: -1,
                transition: { type: 'spring', stiffness: 200, damping: 10 },
              }}
            >
              Teach Better
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-gray-800 mb-10 leading-relaxed max-w-lg"
          >
            Connect with expert tutors for personalized learning — or share your
            knowledge and earn by teaching students worldwide.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/signup">
              <motion.div whileHover={floatHover} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>

            <Link href="/signup?role=tutor">
              <motion.div whileHover={floatHover} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                >
                  Become a Tutor
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center gap-10 mt-14"
            variants={fadeInUp}
          >
            {[
              { label: 'Active Students', value: '10K+' },
              { label: 'Expert Tutors', value: '2K+' },
              { label: 'Classes Completed', value: '50K+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={floatHover}
                className="text-center cursor-default"
              >
                <p className="text-4xl font-bold text-gray-900 drop-shadow-sm">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-700">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ---------- RIGHT IMAGE ---------- */}
        <motion.div
          className="relative hidden lg:block"
          initial={{ opacity: 0, x: 100 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute -inset-8 bg-white/25 blur-2xl rounded-[2rem]"
            animate={floatLoop.animate}
          />

          <motion.div
            animate={floatLoop.animate}
            whileHover={{
              y: -8,
              scale: 1.05,
              boxShadow: '0 0 40px rgba(0,0,0,0.25)',
              transition: { type: 'spring', stiffness: 90, damping: 10 },
            }}
            className="relative aspect-[4/3] w-full max-w-xl mx-auto border-[5px] border-gray-900 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.2)]"
          >
            <Image
              src="/images/children.jpg"
              alt="Happy students learning together"
              fill
              priority
              sizes="(min-width:1024px) 520px, 100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
