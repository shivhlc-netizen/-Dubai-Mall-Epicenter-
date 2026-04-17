'use client';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface Props {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({ value, suffix = '', decimals = 0, duration = 2.5, className = '' }: Props) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <span ref={ref} className={className}>
      {inView ? (
        <CountUp end={value} suffix={suffix} decimals={decimals} duration={duration} separator="," />
      ) : (
        `0${suffix}`
      )}
    </span>
  );
}
