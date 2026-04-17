'use client';
import { motion, AnimatePresence } from 'framer-motion';

export type TeddyState = 'neutral' | 'typing' | 'success' | 'error' | 'covering-eyes';

interface TeddyGuideProps {
  state: TeddyState;
  lookAt?: { x: number; y: number } | null;
}

export default function TeddyGuide({ state, lookAt }: TeddyGuideProps) {
  const isCoveringEyes = state === 'covering-eyes';
  
  return (
    <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
      {/* Teddy Character SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ears */}
        <circle cx="30" cy="35" r="8" fill="#8B4513" />
        <circle cx="70" cy="35" r="8" fill="#8B4513" />
        
        {/* Head */}
        <circle cx="50" cy="55" r="25" fill="#A0522D" />
        
        {/* Face/Muzzle */}
        <ellipse cx="50" cy="62" rx="10" ry="8" fill="#D2B48C" />
        
        {/* Nose */}
        <circle cx="50" cy="60" r="2.5" fill="#333" />

        {/* Eyes Group */}
        <motion.g
          animate={{
            y: lookAt ? lookAt.y * 2 : 0,
            x: lookAt ? lookAt.x * 2 : 0,
            opacity: isCoveringEyes ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <circle cx="42" cy="52" r="2" fill="#333" />
          <circle cx="58" cy="52" r="2" fill="#333" />
        </motion.g>

        {/* Arms/Paws for Covering Eyes */}
        <AnimatePresence>
          {isCoveringEyes && (
            <motion.g
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <circle cx="38" cy="52" r="6" fill="#8B4513" />
              <circle cx="62" cy="52" r="6" fill="#8B4513" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Mouth/Expression */}
        <motion.path
          d={state === 'success' ? "M 45 65 Q 50 70 55 65" : "M 47 67 Q 50 67 53 67"}
          stroke="#333"
          strokeWidth="1"
          fill="transparent"
          animate={{
            d: state === 'success' ? "M 45 65 Q 50 70 55 65" : 
               state === 'error' ? "M 45 68 Q 50 63 55 68" : 
               "M 47 67 Q 50 67 53 67"
          }}
        />
      </svg>

      {/* Speech Bubble / Suggestion */}
      <AnimatePresence>
        {state !== 'neutral' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 60 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-0 right-[-80px] bg-gold/90 text-dark text-[10px] font-bold px-3 py-2 rounded-lg rounded-bl-none shadow-lg max-w-[120px]"
          >
            {state === 'typing' && "Looking good!"}
            {state === 'covering-eyes' && "I'm not looking!"}
            {state === 'error' && "Wait, something's wrong!"}
            {state === 'success' && "Perfect! Go ahead!"}
            <div className="absolute bottom-[-5px] left-0 w-0 h-0 border-t-[5px] border-t-gold/90 border-r-[5px] border-r-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
