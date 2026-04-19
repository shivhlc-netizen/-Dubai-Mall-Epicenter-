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
  return (
    <span className={className}>
      <CountUp 
        end={value} 
        suffix={suffix} 
        decimals={decimals} 
        duration={duration} 
        separator="," 
        enableScrollSpy={true}
        scrollSpyOnce={true}
      />
    </span>
  );
}
