'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      className="relative overflow-hidden py-24 lg:py-36 bg-gradient-to-b from-white to-primary/5"
    >
      {/* Soft background glow */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-3xl rounded-full"
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
          <motion.h1
            className="text-5xl lg:text-6xl font-extrabold text-text leading-tight mb-6 space-y-2"
          >
            {/* Learn Smarter */}
            <motion.span
              className="block text-primary"
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.05, 1],
              }}
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
              className="block text-text"
              animate={{
                y: [0, 8, 0],
                scale: [1, 1.03, 1],
              }}
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
            className="text-lg text-muted mb-10 leading-relaxed max-w-lg"
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
                  className="bg-primary hover:bg-primary/90 text-text font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
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
                  className="w-full sm:w-auto border-primary/40 hover:border-primary/70 hover:text-primary"
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
                <p className="text-4xl font-bold text-text drop-shadow-sm">
                  {stat.value}
                </p>
                <p className="text-sm text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ---------- RIGHT DECORATIVE CARD ---------- */}
        <motion.div
          className="relative hidden lg:block"
          initial={{ opacity: 0, x: 100 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
        >
          {/* Gradient background behind card */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl transform rotate-3"
            animate={floatLoop.animate}
          />

          {/* Floating Card */}
          <motion.div
            animate={floatLoop.animate}
            whileHover={{
              y: -10,
              scale: 1.05,
              rotate: 0,
              transition: { type: 'spring', stiffness: 90, damping: 10 },
            }}
          >
            <Card className="relative p-8 rounded-2xl shadow-soft bg-white transform -rotate-3 hover:rotate-0 transition-all duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3 mt-6">
                  <div className="h-4 bg-primary/30 rounded"></div>
                  <div className="h-4 bg-primary/30 rounded"></div>
                  <div className="h-4 bg-primary/30 rounded w-5/6"></div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
