import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

const LOADING_MESSAGES = [
  'Analyzing your topic...',
  'Crafting custom questions...',
  'Personalizing game content...',
  'Building your experience...',
  'Almost ready...',
];

export function GeneratingContent({ onComplete, duration = 3000 }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = duration / LOADING_MESSAGES.length;
    const progressInterval = 50;

    const messageTimer = setInterval(() => {
      setMessageIndex(prev => {
        if (prev < LOADING_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, messageInterval);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + (100 / (duration / progressInterval));
        }
        return 100;
      });
    }, progressInterval);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
    >
      <Card className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-6"
            >
              <svg className="w-full h-full" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="#111827"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="31.4 31.4"
                />
              </svg>
            </motion.div>

            <motion.h2
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-black text-gray-900 mb-2 tracking-tight"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.h2>

            <p className="text-gray-700 text-sm font-medium">
              Creating your personalized event
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gray-900 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
