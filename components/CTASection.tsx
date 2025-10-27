'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp, scaleHover, useScrollAnimation } from './animations';

export default function CTASection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-primary/10 to-primaryWeak">
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-text mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-muted mb-8">
          Join thousands of students and tutors already using Tuitions time.
        </p>
        <Link href="/signup">
          <motion.div whileHover={scaleHover} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="bg-text hover:bg-text/90 text-white font-semibold">
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
}
