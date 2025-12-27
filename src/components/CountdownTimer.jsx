import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CountdownTimer({ seconds, onComplete, size = 'md' }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progress = (timeLeft / seconds) * 100;
  const isUrgent = timeLeft <= 5;

  const sizes = {
    sm: { container: 'w-16 h-16', text: 'text-xl' },
    md: { container: 'w-24 h-24', text: 'text-3xl' },
    lg: { container: 'w-32 h-32', text: 'text-4xl' },
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizes[size].container}`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            className={isUrgent ? 'text-red-500' : 'text-blue-500'}
            initial={{ pathLength: 1 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.5 }}
            style={{
              strokeDasharray: '100',
              strokeDashoffset: '0',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={timeLeft}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-bold ${sizes[size].text} ${isUrgent ? 'text-red-600' : 'text-gray-800'}`}
          >
            {timeLeft}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
