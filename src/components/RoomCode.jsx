import { useState } from 'react';
import { motion } from 'framer-motion';

export function RoomCode({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2">Room Code</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-blue-400 transition-all"
      >
        <span className="text-3xl font-bold tracking-wider text-blue-600">
          {code}
        </span>
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </motion.button>
      {copied && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-green-600 mt-2"
        >
          Copied!
        </motion.p>
      )}
    </div>
  );
}
