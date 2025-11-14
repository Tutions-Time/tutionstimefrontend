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
      className="relative overflow-hidden bg-[#FFD54F] min-h-screen flex items-center"
    >
      {/* Background glow */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 bg-white/30 blur-3xl rounded-full"
        animate={floatLoop.animate}
      />

      <motion.div
        className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 items-center px-6 lg:px-8 gap-12 relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* ---------- LEFT CONTENT ---------- */}
        <motion.div variants={slideInLeft}>
          <motion.h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 space-y-2">
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
           Find the Right Tutor for Every Subject, Anytime! Learn smarter and faster with qualified
tutors from Nursery to Graduation level.

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
                  Find a Tutor <ArrowRight className="ml-2 h-5 w-5" />
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

        {/* ---------- RIGHT IMAGE (Static, Full Height Split) ---------- */}
        <motion.div
          className="relative hidden lg:block h-[100vh] w-full"
          initial={{ opacity: 0, x: 100 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative h-full mt-2 w-full">
            <Image
              src="/images/newgirlll.png"
              alt="Girl standing with books"
              fill
              priority
              sizes="(min-width:1024px) 50vw, 110vw"
              className="object-cover object-center"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
