'use client';
import { useRef } from 'react';
import { useInView, Variants, MotionProps } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -120 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
  },
};
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};
export const scaleHover: MotionProps['whileHover'] = {
  scale: 1.05,
  transition: { type: 'spring', stiffness: 120, damping: 8 },
};

export const floatHover: MotionProps['whileHover'] = {
  y: -8,
  transition: { type: 'spring', stiffness: 120, damping: 10 },
};

export const floatLoop: MotionProps = {
  animate: {
    y: [0, -12, 0],
    transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
  },
};

export const useScrollAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return { ref, isInView };
};
