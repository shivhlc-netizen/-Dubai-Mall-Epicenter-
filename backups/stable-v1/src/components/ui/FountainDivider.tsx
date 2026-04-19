'use client';
import { motion } from 'framer-motion';

export default function FountainDivider() {
  return (
    <div className="relative h-24 w-full overflow-hidden fountain-wave pointer-events-none opacity-40">
      <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 100">
        <motion.path
          animate={{
            d: [
              "M0 50 Q 360 0 720 50 T 1440 50",
              "M0 50 Q 360 100 720 50 T 1440 50",
              "M0 50 Q 360 0 720 50 T 1440 50"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="0.5"
        />
        <motion.path
          animate={{
            d: [
              "M0 60 Q 360 100 720 60 T 1440 60",
              "M0 60 Q 360 20 720 60 T 1440 60",
              "M0 60 Q 360 100 720 60 T 1440 60"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: -2 }}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#C9A052" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
