'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const FallingMoney = ({ count = 30 }: { count?: number }) => {
  const dollars = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}vw`,
      duration: 5 + Math.random() * 10, // 5 to 15 seconds
      delay: Math.random() * 10, // 0 to 10 seconds
      scale: 0.5 + Math.random() * 1.5, // 0.5 to 2
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
      {dollars.map((dollar) => (
        <motion.div
          key={dollar.id}
          className="absolute text-red-400/20 font-bold"
          style={{
            left: dollar.x,
            scale: dollar.scale,
          }}
          initial={{ y: '110vh' }}
          animate={{ y: '-10vh' }}
          transition={{
            duration: dollar.duration,
            delay: dollar.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
        >
          $
        </motion.div>
      ))}
    </div>
  );
};

export default FallingMoney;
