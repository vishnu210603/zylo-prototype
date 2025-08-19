import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBlobBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {/* Left Blob - Blue-Cyan Gradient */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-400/60 to-cyan-400/60 filter blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
      
      {/* Right Blob - Cyan-Blue Gradient */}
      <motion.div
        className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-400/60 to-blue-500/60 filter blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  );
};

export default AnimatedBlobBackground;
