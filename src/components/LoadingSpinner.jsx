import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizes[size]} border-4 border-gray-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
}
